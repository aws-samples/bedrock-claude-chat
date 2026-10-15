import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { backendHandlerBundlingHooks } from "../lib/constructs/api";

const LF_SCRIPT = "#!/bin/bash\nexec true\n";
const CRLF_SCRIPT = "#!/bin/bash\r\nexec true\r\n";

describe("backendHandlerBundlingHooks", () => {
  let inputDir: string;
  let outputDir: string;

  beforeEach(() => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), "backend-api-bundling-")
    );
    inputDir = path.join(root, "input");
    outputDir = path.join(root, "output");
    fs.mkdirSync(inputDir);
    fs.mkdirSync(outputDir);
  });

  afterEach(() => {
    fs.rmSync(path.dirname(inputDir), { recursive: true, force: true });
  });

  test("should copy a CRLF run.sh to the zip root as LF mode 0755", () => {
    // Given
    fs.writeFileSync(path.join(inputDir, "run.sh"), CRLF_SCRIPT);
    const hooks = backendHandlerBundlingHooks();

    // When
    execFileSync(
      "bash",
      ["-c", hooks.afterBundling(inputDir, outputDir).join(" && ")],
      { stdio: "pipe" }
    );

    // Then
    const outputScript = path.join(outputDir, "run.sh");
    expect(fs.readFileSync(outputScript, "utf8")).toBe(LF_SCRIPT);
    expect(fs.statSync(outputScript).mode & 0o777).toBe(0o755);
    expect(hooks.beforeBundling(inputDir, outputDir)).toEqual([]);
  });

  test("should keep LF bytes and embed the directories passed to the hook", () => {
    // Given
    fs.writeFileSync(path.join(inputDir, "run.sh"), LF_SCRIPT);
    const hooks = backendHandlerBundlingHooks();
    const assetCommand = hooks
      .afterBundling("/asset-input", "/asset-output")
      .join(" && ");
    const mountedCommand = hooks
      .afterBundling(inputDir, outputDir)
      .join(" && ");

    // When
    execFileSync("bash", ["-c", mountedCommand], { stdio: "pipe" });

    // Then
    const outputScript = path.join(outputDir, "run.sh");
    expect(fs.readFileSync(outputScript, "utf8")).toBe(LF_SCRIPT);
    expect(fs.statSync(outputScript).mode & 0o777).toBe(0o755);
    expect(assetCommand).toContain("'/asset-input/run.sh'");
    expect(assetCommand).toContain("'/asset-output/run.sh'");
    expect(mountedCommand).toContain(`'${inputDir}/run.sh'`);
    expect(mountedCommand).toContain(`'${outputDir}/run.sh'`);
    expect(mountedCommand).not.toContain("/asset-input");
    expect(mountedCommand).not.toContain("/asset-output");
  });

  test("should exit non-zero and leave no output script when run.sh is absent", () => {
    // Given
    const command = backendHandlerBundlingHooks()
      .afterBundling(inputDir, outputDir)
      .join(" && ");

    // When / Then
    expect(() => {
      execFileSync("bash", ["-c", command], { stdio: "pipe" });
    }).toThrow(/Command failed/);
    expect(fs.existsSync(path.join(outputDir, "run.sh"))).toBe(false);
  });
});
