import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { access, mkdir } from "fs/promises";
import path from "path";

type GenerateAssignmentImageArgs = {
  studentId: string;
  studentName: string;
  focusArea: string;
  bloomLevel: string;
  assignmentTitle: string;
  assignmentText: string;
  rationale?: string;
  interests?: string[];
  promptOverride?: string;
  previousImageUrl?: string | null;
};

type PythonImageResult = {
  output_path?: string;
  prompt?: string;
  duration_ms?: number;
  model_family_used?: string;
  model_label_used?: string;
};

type RemoteImageResult = {
  image_url?: string;
  prompt?: string;
  duration_ms?: number;
  estimated_seconds?: number;
  model_family_used?: string;
  model_label_used?: string;
};

type ImageModelConfig = {
  renderModelFamily: string;
  renderModelPath: string;
  editModelFamily: string;
  editModelPath: string;
};

function compactText(value: string | undefined, maxChars: number) {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function sanitizePathSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-_]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "student";
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

export function getAssignmentImageEstimateSeconds() {
  return parsePositiveInt(process.env.ASSIGNMENT_IMAGE_ESTIMATED_SECONDS, 70);
}

function getRemoteImageApiUrl() {
  return process.env.ASSIGNMENT_IMAGE_API_URL?.trim() || "";
}

function normalizeModelFamily(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed || fallback;
}

function getConfiguredImageModels(): ImageModelConfig {
  const legacyPrimaryModelFamily = process.env.ASSIGNMENT_IMAGE_MODEL_FAMILY;
  const legacyPrimaryModelPath = process.env.ASSIGNMENT_IMAGE_MODEL_PATH?.trim();
  const legacyFallbackModelFamily = process.env.ASSIGNMENT_IMAGE_FALLBACK_MODEL_FAMILY;
  const legacyFallbackModelPath = process.env.ASSIGNMENT_IMAGE_FALLBACK_MODEL_PATH?.trim();

  const renderModelFamily = normalizeModelFamily(
    process.env.ASSIGNMENT_IMAGE_RENDER_MODEL_FAMILY,
    normalizeModelFamily(legacyFallbackModelFamily, normalizeModelFamily(legacyPrimaryModelFamily, "sd3")),
  );

  const renderModelPath =
    process.env.ASSIGNMENT_IMAGE_RENDER_MODEL_PATH?.trim() ||
    legacyFallbackModelPath ||
    legacyPrimaryModelPath ||
    path.join(process.cwd(), "models", "stable-diffusion-3.5-medium");

  const editModelFamily = normalizeModelFamily(
    process.env.ASSIGNMENT_IMAGE_EDIT_MODEL_FAMILY,
    renderModelFamily,
  );

  const editModelPath =
    process.env.ASSIGNMENT_IMAGE_EDIT_MODEL_PATH?.trim() ||
    renderModelPath;

  return {
    renderModelFamily,
    renderModelPath,
    editModelFamily,
    editModelPath,
  };
}

export function buildAssignmentImagePrompt({
  studentName,
  focusArea,
  bloomLevel,
  assignmentTitle,
  assignmentText,
  rationale,
  interests,
  promptOverride,
}: Omit<GenerateAssignmentImageArgs, "studentId" | "previousImageUrl">) {
  if (promptOverride?.trim()) {
    return promptOverride.trim();
  }

  const compactTitle = compactText(assignmentTitle, 80);
  const compactFocus = compactText(focusArea || "algemene verdieping", 40);
  const compactBloom = compactText(bloomLevel, 24);
  const compactAssignment = compactText(assignmentText, 140);
  const compactRationale = compactText(rationale, 120);
  const compactInterest =
    interests && interests.length > 0 ? compactText(interests[0], 60) : "";

  return [
    "Maak een duidelijke, kindvriendelijke educatieve illustratie in een rustige platte schoolstijl.",
    "Zachte kleuren, overzichtelijke compositie, geen tekst, geen watermerk, geen logo.",
    compactTitle ? `Thema: ${compactTitle}.` : "",
    compactFocus ? `Schoolvak: ${compactFocus}.` : "",
    compactBloom ? `Denkniveau: ${compactBloom}.` : "",
    compactAssignment ? `Laat dit zien: ${compactAssignment}.` : "",
    compactRationale ? `Didactisch doel: ${compactRationale}.` : "",
    compactInterest ? `Subtiele sfeer uit interesse: ${compactInterest}.` : "",
    `Voor leerling ${studentName}. Ondersteun de opdracht zonder het antwoord weg te geven.`,
  ]
    .filter(Boolean)
    .join(" ");
}

function resolvePublicOutputDir(studentId: string) {
  const root = process.env.ASSIGNMENT_IMAGE_OUTPUT_DIR
    ? path.resolve(process.env.ASSIGNMENT_IMAGE_OUTPUT_DIR)
    : path.join(process.cwd(), "public", "generated", "assignment-images", sanitizePathSegment(studentId));

  return root;
}

async function resolveInputImagePath(previousImageUrl?: string | null) {
  if (!previousImageUrl?.startsWith("/")) return null;

  const candidate = path.resolve(process.cwd(), "public", `.${previousImageUrl}`);
  const publicRoot = path.resolve(process.cwd(), "public");
  if (!candidate.startsWith(publicRoot)) return null;

  try {
    await access(candidate);
    return candidate;
  } catch {
    return null;
  }
}

function parsePythonResult(stdout: string) {
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    try {
      return JSON.parse(lines[i]) as PythonImageResult;
    } catch {
      // Ignore non-JSON log lines.
    }
  }

  return {} as PythonImageResult;
}

async function generateAssignmentImageRemote(args: GenerateAssignmentImageArgs) {
  const endpoint = getRemoteImageApiUrl();
  const prompt = buildAssignmentImagePrompt(args);
  const timeoutMs = parsePositiveInt(process.env.ASSIGNMENT_IMAGE_API_TIMEOUT_MS, 300000);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: args.studentId,
      student_name: args.studentName,
      focus_area: args.focusArea,
      bloom_level: args.bloomLevel,
      assignment_title: args.assignmentTitle,
      assignment_text: args.assignmentText,
      rationale: args.rationale,
      interests: args.interests,
      prompt,
      previous_image_url: args.previousImageUrl ?? null,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const payload = (await response.json().catch(() => ({}))) as RemoteImageResult & { detail?: string };
  if (!response.ok) {
    throw new Error(payload.detail || "Cloud-afbeeldingservice gaf een fout terug.");
  }

  if (!payload.image_url) {
    throw new Error("Cloud-afbeeldingservice gaf geen image_url terug.");
  }

  return {
    imageUrl: payload.image_url,
    prompt: payload.prompt?.trim() || prompt,
    durationMs: payload.duration_ms ?? 0,
    estimatedSeconds: payload.estimated_seconds ?? getAssignmentImageEstimateSeconds(),
    modelFamilyUsed: payload.model_family_used ?? "",
    modelLabelUsed: payload.model_label_used ?? "",
  };
}

export async function generateAssignmentImage(args: GenerateAssignmentImageArgs) {
  if (getRemoteImageApiUrl()) {
    return generateAssignmentImageRemote(args);
  }

  const outputDir = resolvePublicOutputDir(args.studentId);
  await mkdir(outputDir, { recursive: true });

  const prompt = buildAssignmentImagePrompt(args);
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.png`;
  const outputPath = path.join(outputDir, fileName);
  const inputImagePath = await resolveInputImagePath(args.previousImageUrl);
  const modelConfig = getConfiguredImageModels();
  const useEditModel = Boolean(inputImagePath);
  const modelFamily = useEditModel ? modelConfig.editModelFamily : modelConfig.renderModelFamily;
  const modelPath = useEditModel ? modelConfig.editModelPath : modelConfig.renderModelPath;

  const pythonBin = process.env.ASSIGNMENT_IMAGE_PYTHON_BIN || "python3";
  const scriptPath = path.join(process.cwd(), "scripts", "generate_assignment_image.py");

  const width = String(parsePositiveInt(process.env.ASSIGNMENT_IMAGE_WIDTH, 1024));
  const height = String(parsePositiveInt(process.env.ASSIGNMENT_IMAGE_HEIGHT, 768));
  const steps = String(parsePositiveInt(process.env.ASSIGNMENT_IMAGE_STEPS, 28));

  const commandArgs = [
    scriptPath,
    "--model-family",
    modelFamily,
    "--model-path",
    modelPath,
    "--output-path",
    outputPath,
    "--prompt",
    prompt,
    "--width",
    width,
    "--height",
    height,
    "--steps",
    steps,
  ];

  if (inputImagePath) {
    commandArgs.push("--input-image", inputImagePath);
  }

  const startedAt = Date.now();
  const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(pythonBin, commandArgs, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            stderr.trim() ||
              stdout.trim() ||
              `Afbeelding genereren mislukte met exitcode ${code ?? "onbekend"}.`,
          ),
        );
      }
    });
  });

  const parsed = parsePythonResult(result.stdout);
  const relativeBase = path.relative(path.join(process.cwd(), "public"), outputPath).split(path.sep).join("/");

  return {
    imageUrl: `/${relativeBase}`,
    prompt: parsed.prompt?.trim() || prompt,
    durationMs: parsed.duration_ms ?? Date.now() - startedAt,
    estimatedSeconds: getAssignmentImageEstimateSeconds(),
    modelFamilyUsed: parsed.model_family_used ?? modelFamily,
    modelLabelUsed: parsed.model_label_used ?? modelFamily.toUpperCase(),
  };
}
