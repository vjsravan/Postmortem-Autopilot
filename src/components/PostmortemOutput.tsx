'use client';

import { useState } from 'react';
import { PostmortemResult } from '@/types';

interface Props {
    result: PostmortemResult;
}

type ExportTab = 'preview' | 'markdown' | 'confluence';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  P1: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500 text-white' },
    P2: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500 text-white' },
        P3: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500 text-black' },
       };

const SOURCE_COLORS: Record<string, string> = {
  GitHub: 'bg-emerald-500/20 text-emerald-400',
      PagerDuty: 'bg-orange-500/20 text-orange-400',
      Slack: 'bg-violet-500/20 text-violet-400',
      System: 'bg-sky-500/20 text-sky-400',
      Manual: 'bg-slate-500/20 text-slate-400',
    };

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      low: 'bg-green-500/20 text-green-400',
    };

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
});
}

function downloadFile(content: string, filename: string, type = 'text/plain') {
    const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PostmortemOutput({ result }: Props) {
  const [tab, setTab] = useState<ExportTab>('preview');
  const [copied, setCopied] = useState(false);

  const sevStyle = SEVERITY_STYLES[result.severity.level] || SEVERITY_STYLES.P2;

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
};

  const exportContent = tab === 'markdown' ? result.markdown : result.confluenceFormat;
  const exportFilename = tab === 'markdown'
    ? `postmortem-${result.rawInput.serviceName}-${Date.now()}.md`
    : `postmortem-${result.rawInput.serviceName}-${Date.now()}.txt`;

  return (
    <div className="mt-8 space-y-6">
{/* Header */}
      <div className={`rounded-2xl border p-6 ${sevStyle.bg} ${sevStyle.border}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sevStyle.badge}`}>
{result.severity.level}
              </span>
              <h2 className="text-xl font-bold text-white">{result.title}</h2>
            </div>
            <p className={`text-sm ${sevStyle.text}`}>{result.severity.reasoning}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Generated {new Date(result.generatedAt).toLocaleString()}</div>
            <div>{result.rawInput.serviceName}</div>
          </div>
        </div>
      </div>

{/* Gap Warning */}
{result.timelineGaps.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-400 text-lg mt-0.5">⚠️</span>
              <div>
                <h3 className="text-amber-400 font-semibold text-sm mb-2">
  {result.timelineGaps.length} Timeline Gap{result.timelineGaps.length > 1 ? 's' : ''} Detected
              </h3>
              <div className="space-y-1">
{result.timelineGaps.map((gap, i) => (
                  <div key={i} className="text-amber-300/80 text-sm">
                    <span className="font-mono">{gap.from} → {gap.to}</span>
                    <span className="text-amber-500 ml-2">({gap.durationMinutes} min)</span>
                    <span className="text-slate-400 ml-2">— {gap.note}</span>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        )}

{/* Summary */}
      <Section title="Executive Summary" icon="📋">
                <p className="text-slate-300 leading-relaxed">{result.summary}</p>
              </Section>

        {/* Timeline */}
      <Section title="Timeline of Events" icon="🕐">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 pr-4 text-slate-400 font-medium w-24">Time (UTC)</th>
                        <th className="text-left py-2 pr-4 text-slate-400 font-medium">Event</th>
                        <th className="text-left py-2 text-slate-400 font-medium w-28">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
        {result.timeline.map((event, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 pr-4 font-mono text-sky-400 text-xs">{event.time}</td>
                          <td className="py-2.5 pr-4 text-slate-300">{event.event}</td>
                          <td className="py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${SOURCE_COLORS[event.source] || SOURCE_COLORS.Manual}`}>
        {event.source}
                    </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

        {/* Root Cause */}
      <Section title="Root Cause Chain" icon="🔍">
                <p className="text-slate-300 leading-relaxed">{result.rootCauseChain}</p>
              </Section>

        {/* 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title="Contributing Factors" icon="⚙️">
                  <ul className="space-y-2">
        {result.contributingFactors.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-slate-500 mt-0.5">•</span>{f}
              </li>
                    ))}
                  </ul>
                </Section>

                <div className="space-y-4">
                  <Section title="What Went Well" icon="✅">
                    <ul className="space-y-2">
        {result.whatWentWell.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                          <span className="text-emerald-400 mt-0.5">✓</span>{w}
                </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="What Went Wrong" icon="❌">
                    <ul className="space-y-2">
        {result.whatWentWrong.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                          <span className="text-red-400 mt-0.5">✗</span>{w}
                </li>
                      ))}
                    </ul>
                  </Section>
                </div>
              </div>

        {/* Action Items */}
      <Section title="Action Items" icon="📌">
                <div className="space-y-3">
        {result.actionItems.map(item => (
                    <div key={item.id} className="flex items-start gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <span className="text-slate-500 font-mono text-sm mt-0.5 w-6 shrink-0">#{item.id}</span>
                      <div className="flex-1">
                        <p className="text-slate-200 text-sm font-medium">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-400">👤 {item.owner}</span>
                          <span className="text-xs text-slate-500">·</span>
                          <span className="text-xs text-slate-400">📅 {item.dueDate}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_STYLES[item.priority]}`}>
        {item.priority}
              </span>
                    </div>
                  ))}
        </div>
              </Section>

        {/* Export */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-4">
                  <div className="flex">
        {(['preview', 'markdown', 'confluence'] as ExportTab[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-3 text-sm font-medium transition-colors capitalize border-b-2 -mb-px ${
                          tab === t
                            ? 'border-sky-500 text-sky-400'
                            : 'border-transparent text-slate-400 hover:text-slate-300'
        }`}
                      >
        {t === 'confluence' ? 'Confluence' : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
          </div>
        {tab !== 'preview' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(exportContent)}
                        className="text-xs text-slate-400 hover:text-white border border-slate-600 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700"
                      >
        {copied ? '✓ Copied!' : 'Copy'}
              </button>
                      <button
                        onClick={() => downloadFile(exportContent, exportFilename)}
                        className="text-xs text-sky-400 hover:text-sky-300 border border-sky-500/30 rounded-lg px-3 py-1.5 transition-colors hover:bg-sky-500/10"
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4">
        {tab === 'preview' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-slate-300 text-sm font-sans leading-relaxed">
        {result.markdown}
                      </pre>
                    </div>
                  ) : (
                    <textarea
                      readOnly
              value={exportContent}
              className="w-full bg-transparent text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                      rows={30}
            />
                  )}
                </div>
              </div>
            </div>
          );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <span>{icon}</span>
    {title}
      </h3>
    {children}
    </div>
      );
}
