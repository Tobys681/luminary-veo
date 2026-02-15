
import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { GenerationSettings } from "../types";

const extractBase64Data = (dataUrl: string) => {
  return {
    data: dataUrl.split(',')[1],
    mime: dataUrl.split(';')[0].split(':')[1] || 'image/png'
  };
};

export const generateVideo = async (settings: GenerationSettings) => {
  // Always create a new instance right before calling to ensure latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation;

  if (settings.mode === 'multi-reference') {
    const referenceImagesPayload = settings.referenceImages.map(img => {
      const { data, mime } = extractBase64Data(img);
      return {
        image: {
          imageBytes: data,
          mimeType: mime,
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      };
    });

    operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: settings.prompt,
      config: {
        numberOfVideos: 1,
        referenceImages: referenceImagesPayload,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
  } else if (settings.mode === 'image-to-video') {
    const startImg = settings.startImage ? extractBase64Data(settings.startImage) : null;
    const endImg = settings.endImage ? extractBase64Data(settings.endImage) : null;

    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: settings.prompt || undefined,
      image: startImg ? {
        imageBytes: startImg.data,
        mimeType: startImg.mime,
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: settings.resolution,
        aspectRatio: settings.aspectRatio,
        lastFrame: endImg ? {
            imageBytes: endImg.data,
            mimeType: endImg.mime,
        } : undefined
      }
    });
  } else {
    // Text to Video
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: settings.prompt,
      config: {
        numberOfVideos: 1,
        resolution: settings.resolution,
        aspectRatio: settings.aspectRatio
      }
    });
  }

  // Polling for completion
  let pollCount = 0;
  while (!operation.done) {
    // Wait 10 seconds between checks
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
    pollCount++;
    
    // Safety timeout after ~10 minutes
    if (pollCount > 60) throw new Error("Generation timed out");
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a valid result.");

  // Fetch the actual video bytes using the API key
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
