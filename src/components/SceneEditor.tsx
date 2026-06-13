"use client";

import {
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Film,
  Hash,
  ImageIcon,
  Loader2,
  Music2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ReelSceneOutput } from "@/lib/schemas/reelScriptSchema";

export type SceneEditorAsset = {
  id: string;
  type: string;
  originalName: string;
  order: number;
};

export type SceneEditorScript = {
  id: string;
  title: string;
  hook: string;
  scenes: ReelSceneOutput[];
  caption: string;
  hashtags: string[];
  audioSuggestion: string | null;
  generationSource: "ai" | "local";
};

export type SceneEditorHandle = {
  hasUnsavedChanges: () => boolean;
  saveIfDirty: () => Promise<SceneEditorScript | null>;
};

type EditableScene = ReelSceneOutput & {
  clientId: string;
};

type DraftScript = {
  title: string;
  hook: string;
  caption: string;
  hashtagsText: string;
  audioSuggestion: string;
  scenes: EditableScene[];
};

const motions = [
  "slow_zoom_in",
  "slow_zoom_out",
  "pan_up",
  "pan_down",
  "static",
] as const;

const motionLabels: Record<(typeof motions)[number], string> = {
  slow_zoom_in: "Slow zoom in",
  slow_zoom_out: "Slow zoom out",
  pan_up: "Pan up",
  pan_down: "Pan down",
  static: "Static",
};

type SceneEditorProps = {
  projectId: string;
  projectDuration: number;
  assets: SceneEditorAsset[];
  script: SceneEditorScript;
  onDirtyChange?: (isDirty: boolean) => void;
  onScriptSaved: (script: SceneEditorScript) => void;
};

export const SceneEditor = forwardRef<SceneEditorHandle, SceneEditorProps>(
  function SceneEditor(
    {
      assets,
      onDirtyChange,
      onScriptSaved,
      projectDuration,
      projectId,
      script,
    },
    ref,
  ) {
    const [draft, setDraft] = useState(() => createDraft(script, assets));
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const totalDuration = useMemo(
      () =>
        draft.scenes.reduce(
          (total, scene) =>
            total + (Number.isFinite(scene.duration) ? scene.duration : 0),
          0,
        ),
      [draft.scenes],
    );
    const invalidSceneOrders = useMemo(
      () =>
        draft.scenes
          .filter(
            (scene) =>
              scene.assetIndex < 0 || scene.assetIndex >= assets.length,
          )
          .map((scene) => scene.order),
      [assets.length, draft.scenes],
    );
    const hashtags = useMemo(
      () => parseHashtags(draft.hashtagsText),
      [draft.hashtagsText],
    );
    const exceedsDuration = totalDuration > projectDuration;

    useEffect(() => {
      onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    useImperativeHandle(ref, () => ({
      hasUnsavedChanges: () => isDirty,
      saveIfDirty: () => (isDirty ? saveScript() : Promise.resolve(script)),
    }));

    function markDirty() {
      setIsDirty(true);
      setSuccess("");
      setError("");
    }

    function updateDraftField<K extends keyof DraftScript>(
      field: K,
      value: DraftScript[K],
    ) {
      setDraft((current) => ({ ...current, [field]: value }));
      markDirty();
    }

    function updateScene(
      clientId: string,
      changes: Partial<Omit<EditableScene, "clientId">>,
    ) {
      setDraft((current) => ({
        ...current,
        scenes: current.scenes.map((scene) =>
          scene.clientId === clientId ? { ...scene, ...changes } : scene,
        ),
      }));
      markDirty();
    }

    function addScene() {
      setDraft((current) => ({
        ...current,
        scenes: normalizeSceneOrder([
          ...current.scenes,
          createEmptyScene(assets, current.scenes.length + 1, projectDuration),
        ]),
      }));
      markDirty();
    }

    function removeScene(clientId: string) {
      setDraft((current) => {
        if (current.scenes.length === 1) {
          return current;
        }

        return {
          ...current,
          scenes: normalizeSceneOrder(
            current.scenes.filter((scene) => scene.clientId !== clientId),
          ),
        };
      });
      markDirty();
    }

    function moveScene(clientId: string, direction: "up" | "down") {
      setDraft((current) => {
        const index = current.scenes.findIndex(
          (scene) => scene.clientId === clientId,
        );
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (
          index < 0 ||
          targetIndex < 0 ||
          targetIndex >= current.scenes.length
        ) {
          return current;
        }

        const nextScenes = [...current.scenes];
        const currentScene = nextScenes[index];
        const targetScene = nextScenes[targetIndex];

        nextScenes[index] = targetScene;
        nextScenes[targetIndex] = currentScene;

        return {
          ...current,
          scenes: normalizeSceneOrder(nextScenes),
        };
      });
      markDirty();
    }

    async function saveScript() {
      if (invalidSceneOrders.length > 0) {
        setError("Escolhe um asset válido em todas as cenas antes de guardar.");
        return null;
      }

      setIsSaving(true);
      setError("");
      setSuccess("");

      try {
        const response = await fetch(`/api/reels/${projectId}/script`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: draft.title,
            hook: draft.hook,
            caption: draft.caption,
            hashtags,
            audioSuggestion: draft.audioSuggestion,
            scenes: draft.scenes.map((scene) => ({
              order: scene.order,
              duration: scene.duration,
              assetIndex: scene.assetIndex,
              onScreenText: scene.onScreenText,
              motion: scene.motion,
              notes: scene.notes,
            })),
          }),
        });
        const data = (await response.json().catch(() => null)) as {
          script?: SceneEditorScript;
          error?: string;
        } | null;

        if (!response.ok || !data?.script) {
          setError(data?.error ?? "Não foi possível guardar as alterações.");
          return null;
        }

        setDraft(createDraft(data.script, assets));
        setIsDirty(false);
        setSuccess("Alterações guardadas com sucesso.");
        onScriptSaved(data.script);
        return data.script;
      } catch {
        setError("Não foi possível guardar as alterações. Tenta novamente.");
        return null;
      } finally {
        setIsSaving(false);
      }
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Badge variant="cream">Timeline editável</Badge>
            <h3 className="mt-3 font-serif text-4xl text-bloom-ink">
              Editor do Reel
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-bloom-ink/58">
              Afina o roteiro, escolhe os assets de cada cena e guarda a
              timeline antes da renderização do vídeo.
            </p>
          </div>

          <div className="rounded-lg border border-bloom-olive/18 bg-bloom-porcelain/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42">
              Duração estimada
            </p>
            <p className="mt-1 font-serif text-3xl text-bloom-ink">
              {formatDuration(totalDuration)}
            </p>
            <p className="text-xs text-bloom-ink/48">
              Meta do projeto: {projectDuration}s
            </p>
          </div>
        </div>

        {isDirty ? (
          <StatusMessage
            tone="warning"
            message="Tens alterações por guardar. Ao gerar o vídeo, o BloomStudio guarda a timeline primeiro."
          />
        ) : null}

        {exceedsDuration ? (
          <StatusMessage
            tone="warning"
            message="A duração total ultrapassa a duração definida no projeto."
          />
        ) : null}

        {invalidSceneOrders.length > 0 ? (
          <StatusMessage
            tone="warning"
            message={`Cena sem asset válido: ${invalidSceneOrders.join(", ")}.`}
          />
        ) : null}

        {success ? <StatusMessage tone="success" message={success} /> : null}
        {error ? <StatusMessage tone="error" message={error} /> : null}

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="space-y-4 p-5">
            <div className="space-y-2">
              <label
                htmlFor="script-title"
                className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42"
              >
                Título sugerido
              </label>
              <Input
                id="script-title"
                value={draft.title}
                onChange={(event) =>
                  updateDraftField("title", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="script-hook"
                className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42"
              >
                Hook
              </label>
              <Textarea
                id="script-hook"
                className="min-h-28"
                value={draft.hook}
                onChange={(event) =>
                  updateDraftField("hook", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="script-audio"
                className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-bloom-ink/42"
              >
                <Music2 aria-hidden className="h-4 w-4 text-bloom-olive" />
                Áudio sugerido
              </label>
              <Input
                id="script-audio"
                value={draft.audioSuggestion}
                onChange={(event) =>
                  updateDraftField("audioSuggestion", event.target.value)
                }
                placeholder="Instrumental suave, piano leve..."
              />
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div className="space-y-2">
              <label
                htmlFor="script-caption"
                className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42"
              >
                Legenda
              </label>
              <Textarea
                id="script-caption"
                className="min-h-40"
                value={draft.caption}
                onChange={(event) =>
                  updateDraftField("caption", event.target.value)
                }
              />
            </div>

            <HashtagEditor
              value={draft.hashtagsText}
              hashtags={hashtags}
              onChange={(value) => updateDraftField("hashtagsText", value)}
            />
          </Card>
        </div>

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h4 className="font-serif text-3xl text-bloom-ink">Cenas</h4>
            <p className="text-sm text-bloom-ink/52">
              Uma cena por card, na ordem em que o reel será montado.
            </p>
          </div>
          <Button onClick={addScene} variant="secondary">
            <Plus aria-hidden className="h-4 w-4" />
            Adicionar cena
          </Button>
        </div>

        <div className="space-y-4">
          {draft.scenes.map((scene, index) => (
            <SceneCard
              key={scene.clientId}
              scene={scene}
              sceneIndex={index}
              sceneCount={draft.scenes.length}
              assets={assets}
              onUpdate={(changes) => updateScene(scene.clientId, changes)}
              onRemove={() => removeScene(scene.clientId)}
              onMoveUp={() => moveScene(scene.clientId, "up")}
              onMoveDown={() => moveScene(scene.clientId, "down")}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={saveScript} disabled={isSaving || !isDirty}>
            {isSaving ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Save aria-hidden className="h-4 w-4" />
            )}
            Guardar alterações
          </Button>
        </div>
      </div>
    );
  },
);

SceneEditor.displayName = "SceneEditor";

function SceneCard({
  assets,
  onMoveDown,
  onMoveUp,
  onRemove,
  onUpdate,
  scene,
  sceneCount,
  sceneIndex,
}: {
  scene: EditableScene;
  sceneIndex: number;
  sceneCount: number;
  assets: SceneEditorAsset[];
  onUpdate: (changes: Partial<Omit<EditableScene, "clientId">>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const selectedAsset =
    scene.assetIndex >= 0 && scene.assetIndex < assets.length
      ? assets[scene.assetIndex]
      : null;

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[17rem_1fr]">
        <div className="bg-bloom-cream/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="olive">Cena {scene.order}</Badge>
            <span className="text-xs text-bloom-ink/48">
              {formatDuration(scene.duration)}
            </span>
          </div>

          <div className="mt-4 aspect-[9/16] overflow-hidden rounded-lg border border-bloom-olive/15 bg-bloom-porcelain">
            {selectedAsset ? (
              selectedAsset.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/media/${selectedAsset.id}`}
                  alt={selectedAsset.originalName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={`/api/media/${selectedAsset.id}`}
                  className="h-full w-full object-cover"
                  controls
                  muted
                />
              )
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-bloom-ink/52">
                <ImageIcon aria-hidden className="h-8 w-8 text-bloom-olive" />
                {assets.length === 0
                  ? "Adiciona imagens ou vídeos ao projeto para usar nesta cena."
                  : "Escolhe um asset para esta cena."}
              </div>
            )}
          </div>

          {selectedAsset ? (
            <div className="mt-3 flex items-start gap-2 text-xs text-bloom-ink/52">
              {selectedAsset.type === "image" ? (
                <ImageIcon
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-bloom-olive"
                />
              ) : (
                <Film
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-bloom-olive"
                />
              )}
              <span className="line-clamp-2">{selectedAsset.originalName}</span>
            </div>
          ) : null}
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onMoveUp}
                variant="ghost"
                size="sm"
                disabled={sceneIndex === 0}
                title="Mover para cima"
              >
                <ArrowUp aria-hidden className="h-4 w-4" />
                Mover para cima
              </Button>
              <Button
                onClick={onMoveDown}
                variant="ghost"
                size="sm"
                disabled={sceneIndex === sceneCount - 1}
                title="Mover para baixo"
              >
                <ArrowDown aria-hidden className="h-4 w-4" />
                Mover para baixo
              </Button>
            </div>

            <Button
              onClick={onRemove}
              variant="secondary"
              size="sm"
              disabled={sceneCount === 1}
            >
              <Trash2 aria-hidden className="h-4 w-4" />
              Remover cena
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Asset usado"
              htmlFor={`scene-asset-${scene.clientId}`}
            >
              <Select
                id={`scene-asset-${scene.clientId}`}
                value={selectedAsset ? String(scene.assetIndex) : ""}
                onChange={(event) =>
                  onUpdate({
                    assetIndex:
                      event.target.value === ""
                        ? -1
                        : Number(event.target.value),
                  })
                }
                disabled={assets.length === 0}
              >
                <option value="">Escolher asset</option>
                {assets.map((asset, index) => (
                  <option key={asset.id} value={index}>
                    {formatAssetOption(asset, index)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Duração" htmlFor={`scene-duration-${scene.clientId}`}>
              <Input
                id={`scene-duration-${scene.clientId}`}
                type="number"
                min="0.5"
                step="0.5"
                inputMode="decimal"
                value={scene.duration}
                onChange={(event) =>
                  onUpdate({ duration: Number(event.target.value) })
                }
              />
            </Field>

            <Field label="Movimento" htmlFor={`scene-motion-${scene.clientId}`}>
              <Select
                id={`scene-motion-${scene.clientId}`}
                value={scene.motion}
                onChange={(event) =>
                  onUpdate({
                    motion: event.target.value as ReelSceneOutput["motion"],
                  })
                }
              >
                {motions.map((motion) => (
                  <option key={motion} value={motion}>
                    {motionLabels[motion]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Texto no ecrã" htmlFor={`scene-text-${scene.clientId}`}>
            <Textarea
              id={`scene-text-${scene.clientId}`}
              className="min-h-24"
              value={scene.onScreenText}
              onChange={(event) =>
                onUpdate({ onScreenText: event.target.value })
              }
            />
          </Field>

          <Field label="Notas" htmlFor={`scene-notes-${scene.clientId}`}>
            <Textarea
              id={`scene-notes-${scene.clientId}`}
              className="min-h-24"
              value={scene.notes}
              onChange={(event) => onUpdate({ notes: event.target.value })}
            />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function HashtagEditor({
  hashtags,
  onChange,
  value,
}: {
  value: string;
  hashtags: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="script-hashtags"
        className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-bloom-ink/42"
      >
        <Hash aria-hidden className="h-4 w-4 text-bloom-olive" />
        Hashtags
      </label>
      <Textarea
        id="script-hashtags"
        className="min-h-24"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#artebotanica #slowliving"
      />
      <div className="flex flex-wrap gap-2">
        {hashtags.length > 0 ? (
          hashtags.map((hashtag) => (
            <Badge key={hashtag} variant="cream">
              {hashtag}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-bloom-ink/48">
            Sem hashtags adicionadas.
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-[0.16em] text-bloom-ink/42"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusMessage({
  message,
  tone,
}: {
  tone: "success" | "warning" | "error";
  message: string;
}) {
  const styles = {
    success: "border-bloom-olive/25 bg-bloom-sage/35 text-bloom-ink",
    warning: "border-bloom-clay/30 bg-bloom-cream text-bloom-ink",
    error: "border-red-200 bg-red-50 text-red-800",
  };
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}
    >
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function createDraft(
  script: SceneEditorScript,
  assets: SceneEditorAsset[],
): DraftScript {
  const scenes =
    script.scenes.length > 0
      ? script.scenes.map((scene, index) => ({
          ...scene,
          clientId: createStableSceneId(scene, index),
        }))
      : [createEmptyScene(assets, 1, 15, "scene-empty-1")];

  return {
    title: script.title,
    hook: script.hook,
    caption: script.caption,
    hashtagsText: script.hashtags.join(" "),
    audioSuggestion: script.audioSuggestion ?? "",
    scenes: normalizeSceneOrder(scenes),
  };
}

function createEmptyScene(
  assets: SceneEditorAsset[],
  order: number,
  projectDuration: number,
  clientId = createClientId(),
): EditableScene {
  return {
    clientId,
    order,
    duration: Math.max(1, Math.min(3, projectDuration)),
    assetIndex: assets.length > 0 ? 0 : -1,
    onScreenText: "",
    motion: "static",
    notes: "",
  };
}

function createStableSceneId(scene: ReelSceneOutput, index: number) {
  return `scene-${index + 1}-${scene.order}`;
}

function normalizeSceneOrder(scenes: EditableScene[]) {
  return scenes.map((scene, index) => ({
    ...scene,
    order: index + 1,
  }));
}

function parseHashtags(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\s,]+/)
        .map((hashtag) => hashtag.trim())
        .filter(Boolean)
        .map((hashtag) => (hashtag.startsWith("#") ? hashtag : `#${hashtag}`)),
    ),
  );
}

function formatAssetOption(asset: SceneEditorAsset, index: number) {
  const typeLabel = asset.type === "video" ? "vídeo" : "imagem";

  return `#${index + 1} - ${asset.originalName} - ${typeLabel}`;
}

function formatDuration(duration: number) {
  return Number.isInteger(duration)
    ? `${duration}s`
    : `${duration.toFixed(1)}s`;
}

function createClientId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
