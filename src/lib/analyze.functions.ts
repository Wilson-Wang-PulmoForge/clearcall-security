import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { analyzeTranscript } from "./analyze.server";

const inputSchema = z.object({
  transcript: z.string().trim().min(40, "Paste at least a few lines of the call.").max(20000),
});

export const analyzeCall = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const request = getRequest();
    return analyzeTranscript(data.transcript, request?.signal);
  });
