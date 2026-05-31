/**
 * PagerDuty Webhook Receiver
  *
   * Configure this endpoint as a webhook in PagerDuty:
    * Extensions > Webhooks > Add Webhook
     * URL: https://your-app.vercel.app/api/webhook
      * Events: incident.resolve
       *
        * When an incident resolves, this endpoint receives the payload and
         * stores it in memory for retrieval by the frontend.
          */

          import { NextRequest, NextResponse } from 'next/server';

          // In-memory store for latest webhook event (replace with DB in production)
          let latestWebhookEvent: Record<string, unknown> | null = null;
          let webhookLog: Array<{ timestamp: string; event: Record<string, unknown> }> = [];

          export async function POST(req: NextRequest) {
            try {
                const payload = await req.json();

                    // Validate it looks like a PagerDuty webhook
                        const messages = payload.messages || payload.event ? [payload] : [];
                            const events = payload.messages || messages;

                                const resolved = events.filter((msg: Record<string, unknown>) => {
                                      const eventType = (msg.event as string) || ((msg.event as Record<string, string>)?.event_type);
                                            return eventType === 'incident.resolve' || eventType === 'incident.resolved';
                                                });

                                                    if (resolved.length > 0) {
                                                          latestWebhookEvent = resolved[0] as Record<string, unknown>;
                                                                webhookLog.push({
                                                                        timestamp: new Date().toISOString(),
                                                                                event: latestWebhookEvent,
                                                                                      });
                                                                                            // Keep only last 20 events
                                                                                                  if (webhookLog.length > 20) {
                                                                                                          webhookLog = webhookLog.slice(-20);
                                                                                                                }
                                                                                                                    } else {
                                                                                                                          // Store any event for debugging
                                                                                                                                latestWebhookEvent = payload;
                                                                                                                                    }
                                                                                                                                    
                                                                                                                                        return NextResponse.json({ status: 'received', events_processed: events.length });
                                                                                                                                          } catch (error) {
                                                                                                                                              console.error('Webhook error:', error);
                                                                                                                                                  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
                                                                                                                                                    }
                                                                                                                                                    }
                                                                                                                                                    
                                                                                                                                                    export async function GET() {
                                                                                                                                                      return NextResponse.json({
                                                                                                                                                          latest: latestWebhookEvent,
                                                                                                                                                              log: webhookLog,
                                                                                                                                                                  count: webhookLog.length,
                                                                                                                                                                    });
                                                                                                                                                                    }
                                                                                                                                                                    
                                                                                                                                                                    /**
                                                                                                                                                                     * Helper: Format a PagerDuty webhook event into a human-readable alert log
                                                                                                                                                                      * that can be pasted into the PagerDuty Alerts field of the form.
                                                                                                                                                                       */
                                                                                                                                                                       export function formatPagerDutyEvent(event: Record<string, unknown>): string {
                                                                                                                                                                         const lines: string[] = [];
                                                                                                                                                                           const incident = (event.incident || event.data) as Record<string, unknown> | undefined;
                                                                                                                                                                           
                                                                                                                                                                             if (incident) {
                                                                                                                                                                                 const createdAt = incident.created_at as string;
                                                                                                                                                                                     const resolvedAt = incident.resolved_at as string;
                                                                                                                                                                                         const title = incident.title as string;
                                                                                                                                                                                             const urgency = incident.urgency as string;
                                                                                                                                                                                                 const status = incident.status as string;
                                                                                                                                                                                                 
                                                                                                                                                                                                     if (createdAt) lines.push(`${new Date(createdAt).toISOString().slice(11, 16)} UTC - INCIDENT CREATED: ${title}`);
                                                                                                                                                                                                         if (urgency) lines.push(`  Urgency: ${urgency.toUpperCase()}`);
                                                                                                                                                                                                             if (status) lines.push(`  Status: ${status}`);
                                                                                                                                                                                                                 if (resolvedAt) lines.push(`${new Date(resolvedAt).toISOString().slice(11, 16)} UTC - INCIDENT RESOLVED`);
                                                                                                                                                                                                                 
                                                                                                                                                                                                                     const logEntries = incident.log_entries as Array<Record<string, unknown>> | undefined;
                                                                                                                                                                                                                         if (logEntries) {
                                                                                                                                                                                                                               for (const entry of logEntries) {
                                                                                                                                                                                                                                       const createdAt2 = entry.created_at as string;
                                                                                                                                                                                                                                               const type = entry.type as string;
                                                                                                                                                                                                                                                       const summary = entry.summary as string;
                                                                                                                                                                                                                                                               if (createdAt2 && summary) {
                                                                                                                                                                                                                                                                         lines.push(`${new Date(createdAt2).toISOString().slice(11, 16)} UTC - ${type}: ${summary}`);
                                                                                                                                                                                                                                                                                 }
                                                                                                                                                                                                                                                                                       }
                                                                                                                                                                                                                                                                                           }
                                                                                                                                                                                                                                                                                             }
                                                                                                                                                                                                                                                                                             
                                                                                                                                                                                                                                                                                               return lines.join('\n');
                                                                                                                                                                                                                                                                                               }
