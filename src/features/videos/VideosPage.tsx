import { useState } from 'react';
import { Clapperboard, Upload, Clock, User } from 'lucide-react';
import { useVideos, useTeam, useUpdateVideoStage } from '@/hooks/queries';
import { Card, PageHeader, Badge, Avatar } from '@/components/ui';
import { videoStageConfig, videoStageOrder } from '@/lib/status';
import { clientName } from '@/data/clients';
import { cn } from '@/lib/utils';
import type { VideoStage, VideoTask, TeamMember } from '@/types';

export function VideosPage() {
  const { data: videos } = useVideos();
  const { data: team } = useTeam();
  const updateStage = useUpdateVideoStage();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<VideoStage | null>(null);

  function onDrop(stage: VideoStage) {
    if (dragId) updateStage.mutate({ id: dragId, stage });
    setDragId(null);
    setOverStage(null);
  }

  const member = (id?: string) => team?.find((m) => m.id === id);

  return (
    <div>
      <PageHeader
        icon={Clapperboard}
        title="Produção de Vídeos"
        subtitle="Roteiro → Gravação → Edição → Aprovação → Agendado"
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {videoStageOrder.map((stage) => {
          const cfg = videoStageConfig[stage];
          const items = (videos ?? []).filter((v) => v.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStage(stage);
              }}
              onDrop={() => onDrop(stage)}
              className={cn(
                'flex w-72 shrink-0 flex-col rounded-2xl border bg-ink-900/50 p-3 transition-colors',
                overStage === stage ? 'border-eye-red/50' : 'border-ink-700/50'
              )}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                  <h2 className="text-sm font-bold text-cloud">{cfg.label}</h2>
                </div>
                <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-cloud-muted">
                  {items.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {items.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    videomaker={member(v.videomakerId)}
                    designer={member(v.designerId)}
                    onDragStart={() => setDragId(v.id)}
                  />
                ))}
                {items.length === 0 && (
                  <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-ink-700 py-8 text-xs text-cloud-dim">
                    Solte um card aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoCard({
  video,
  videomaker,
  designer,
  onDragStart,
}: {
  video: VideoTask;
  videomaker?: TeamMember;
  designer?: TeamMember;
  onDragStart: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="cursor-grab rounded-xl border border-ink-700/60 bg-ink-850 p-3 transition-colors hover:border-eye-red/40 active:cursor-grabbing"
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-eye-red">
        {clientName(video.clientId)}
      </span>
      <p className="mt-1 text-sm font-medium leading-snug text-cloud">{video.title}</p>

      {video.script && (
        <p className="mt-1.5 line-clamp-2 text-xs italic text-cloud-dim">
          “{video.script.hook}”
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-cloud-dim">
        {video.durationSec && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {video.durationSec}s
          </span>
        )}
        {video.dueDate && <span>· {video.dueDate}</span>}
        {video.stage === 'gravacao' && (
          <Badge className="ml-auto bg-eye-red/15 text-eye-red">
            <Upload className="h-3 w-3" /> upload
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-ink-700/50 pt-2">
        {videomaker && (
          <span className="flex items-center gap-1.5" title={`Videomaker: ${videomaker.name}`}>
            <Avatar name={videomaker.name} color={videomaker.avatarColor} size="sm" />
          </span>
        )}
        {designer && designer.id !== videomaker?.id && (
          <span className="flex items-center gap-1.5" title={`Designer: ${designer.name}`}>
            <Avatar name={designer.name} color={designer.avatarColor} size="sm" />
          </span>
        )}
        {!videomaker && !designer && (
          <span className="flex items-center gap-1 text-xs text-cloud-dim">
            <User className="h-3 w-3" /> sem responsável
          </span>
        )}
      </div>
    </div>
  );
}
