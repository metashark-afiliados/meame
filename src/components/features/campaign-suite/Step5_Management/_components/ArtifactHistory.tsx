// RUTA: src/components/features/campaign-suite/Step5_Management/_components/ArtifactHistory.tsx
/**
 * @file ArtifactHistory.tsx
 * @description Componente de UI para mostrar y descargar el historial de artefactos generados.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  getArtifactsForDraftAction,
  getArtifactDownloadUrlAction,
  type ArtifactMetadata,
} from "@/shared/lib/actions/campaign-suite";
import { logger } from "@/shared/lib/logging";
import { Button, DynamicIcon, Skeleton } from "@/components/ui";

interface ArtifactHistoryProps {
  draftId: string;
  title: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function ArtifactHistory({ draftId, title }: ArtifactHistoryProps) {
  const [artifacts, setArtifacts] = useState<ArtifactMetadata[]>([]);
  const [isLoading, startLoadingTransition] = useTransition();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    startLoadingTransition(async () => {
      const result = await getArtifactsForDraftAction(draftId);
      if (result.success) {
        setArtifacts(result.data);
      } else {
        toast.error("Error al cargar el historial", { description: result.error });
      }
    });
  }, [draftId]);

  const handleDownload = async (artifactId: string) => {
    setDownloadingId(artifactId);
    const result = await getArtifactDownloadUrlAction(artifactId);
    if (result.success) {
      window.open(result.data.downloadUrl, '_blank');
    } else {
      toast.error("Error en la descarga", { description: result.error });
    }
    setDownloadingId(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : artifacts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Aún no se han generado exportaciones para este borrador.
          </p>
        ) : (
          <ul className="divide-y">
            <AnimatePresence>
              {artifacts.map((artifact, index) => (
                <motion.li
                  key={artifact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-4">
                    <DynamicIcon name="Package" className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Versión {artifact.version}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(artifact.created_at).toLocaleString()} - {formatBytes(artifact.file_size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(artifact.id)}
                    disabled={!!downloadingId}
                  >
                    {downloadingId === artifact.id ? (
                      <DynamicIcon name="LoaderCircle" className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <DynamicIcon name="Download" className="mr-2 h-4 w-4" />
                    )}
                    Descargar
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
