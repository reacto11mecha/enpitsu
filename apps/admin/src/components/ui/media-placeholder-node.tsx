/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import type { TPlaceholderElement } from "platejs";
import type { PlateElementProps } from "platejs/react";
import * as React from "react";
import {
  PlaceholderPlugin,
  PlaceholderProvider,
  updateUploadHistory,
} from "@platejs/media/react";
import { AudioLines, FileUp, Film, ImageIcon, Loader2Icon } from "lucide-react";
import { KEYS } from "platejs";
import { PlateElement, useEditorPlugin, withHOC } from "platejs/react";
import { useFilePicker } from "use-file-picker";

import { cn } from "~/lib/utils";

const CONTENT: Record<
  string,
  {
    accept: string[];
    content: React.ReactNode;
    icon: React.ReactNode;
  }
> = {
  [KEYS.audio]: {
    accept: ["audio/*"],
    content: "Add an audio file",
    icon: <AudioLines />,
  },
  [KEYS.file]: {
    accept: ["*"],
    content: "Add a file",
    icon: <FileUp />,
  },
  [KEYS.img]: {
    accept: ["image/*"],
    content: "Add an image",
    icon: <ImageIcon />,
  },
  [KEYS.video]: {
    accept: ["video/*"],
    content: "Add a video",
    icon: <Film />,
  },
};

export const PlaceholderElement = withHOC(
  PlaceholderProvider,
  function PlaceholderElement(props: PlateElementProps<TPlaceholderElement>) {
    const { editor, element } = props;

    const { api } = useEditorPlugin(PlaceholderPlugin);

    const [base64Url, setBase64Url] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingFile, setLoadingFile] = React.useState<File | null>(null);

    const currentContent = CONTENT[element.mediaType];
    const isImage = element.mediaType === KEYS.img;
    const imageRef = React.useRef<HTMLImageElement>(null);

    const { openFilePicker } = useFilePicker({
      accept: currentContent?.accept,
      multiple: true,
      onFilesSelected: ({ plainFiles: updatedFiles }) => {
        const firstFile = updatedFiles[0];
        const restFiles = updatedFiles.slice(1);

        if (firstFile) {
          replaceCurrentPlaceholder(firstFile);
        }

        if (restFiles.length > 0) {
          editor.getTransforms(PlaceholderPlugin).insert.media(restFiles);
        }
      },
    });

    const replaceCurrentPlaceholder = React.useCallback(
      (file: File) => {
        setIsLoading(true);
        setLoadingFile(file);
        api.placeholder.addUploadingFile(element.id as string, file);

        const reader = new FileReader();
        reader.onload = (event) => {
          setBase64Url(event.target?.result as string);
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      },
      [api.placeholder, element.id],
    );

    React.useEffect(() => {
      if (!base64Url || !loadingFile) return;

      const path = editor.api.findPath(element);

      editor.tf.withoutSaving(() => {
        editor.tf.removeNodes({ at: path });

        const node = {
          children: [{ text: "" }],
          initialHeight: imageRef.current?.height,
          initialWidth: imageRef.current?.width,
          isUpload: true,
          name: element.mediaType === KEYS.file ? loadingFile.name : "",
          placeholderId: element.id as string,
          type: element.mediaType,
          url: base64Url,
        };

        editor.tf.insertNodes(node, { at: path });

        updateUploadHistory(editor, node);
      });

      api.placeholder.removeUploadingFile(element.id as string);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [base64Url, loadingFile, element.id]);

    // React dev mode will call React.useEffect twice
    const isReplaced = React.useRef(false);

    /** Paste and drop */
    React.useEffect(() => {
      if (isReplaced.current) return;

      isReplaced.current = true;
      const currentFiles = api.placeholder.getUploadingFile(
        element.id as string,
      );

      if (!currentFiles) return;

      replaceCurrentPlaceholder(currentFiles);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReplaced]);

    return (
      <PlateElement className="my-1" {...props}>
        {(!isLoading || !isImage) && (
          <div
            className={cn(
              "bg-muted hover:bg-primary/10 flex cursor-pointer items-center rounded-sm p-3 pr-9 select-none",
            )}
            onClick={() => !isLoading && openFilePicker()}
            contentEditable={false}
          >
            <div className="text-muted-foreground/80 relative mr-3 flex [&_svg]:size-6">
              {currentContent?.icon}
            </div>
            <div className="text-muted-foreground text-sm whitespace-nowrap">
              <div>
                {isLoading ? loadingFile?.name : currentContent?.content}
              </div>

              {isLoading && !isImage && (
                <div className="mt-1 flex items-center gap-1.5">
                  <div>{formatBytes(loadingFile?.size ?? 0)}</div>
                  <div>–</div>
                  <div className="flex items-center">
                    <Loader2Icon className="text-muted-foreground mr-1 size-3.5 animate-spin" />
                    Loading...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isImage && isLoading && loadingFile && (
          <ImageProgress file={loadingFile} imageRef={imageRef} />
        )}

        {props.children}
      </PlateElement>
    );
  },
);

export function ImageProgress({
  className,
  file,
  imageRef,
}: {
  file: File;
  className?: string;
  imageRef?: React.RefObject<HTMLImageElement | null>;
}) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) {
    return null;
  }

  return (
    <div className={cn("relative", className)} contentEditable={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        className="h-auto w-full rounded-sm object-cover opacity-50"
        alt={file.name}
        src={objectUrl}
      />
      <div className="absolute right-1 bottom-1 flex items-center space-x-2 rounded-full bg-black/50 px-1 py-0.5">
        <Loader2Icon className="text-muted-foreground size-3.5 animate-spin" />
        <span className="text-xs font-medium text-white">Processing...</span>
      </div>
    </div>
  );
}

function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {},
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];

  if (bytes === 0) return "0 Byte";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytest")
      : (sizes[i] ?? "Bytes")
  }`;
}
