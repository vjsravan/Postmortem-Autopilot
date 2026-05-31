import { IncidentData } from '@/types';

export function buildPrompt(data: IncidentData): string {
  const sections: string[] = [];

    sections.push(`You are an expert SRE (Site Reliability Engineer) tasked with generating a comprehensive, blameless post-mortem document.

    CRITICAL BLAMELESS REQUIREMENT: You MUST NOT mention any individual names, usernames, or assign blame to specific people anywhere in your output. Focus exclusively on systems, processes, tooling, and organizational patterns. Replace any individual names with role-based descriptions (e.g., "the on-call engineer", "the deployment system", "the monitoring pipeline").

    Generate a structured post-mortem for the following incident:`);

      sections.push(`## INCIDENT DETAILS
      - **Service Affected**: ${data.serviceName}
      - **Time Range**: ${data.timeRange}
      - **Analysis Date**: ${new Date().toISOString()}`);

        if (data.githubCommits) {
            sections.push(`## GITHUB COMMITS/DEPLOYS IN WINDOW
            ${data.githubCommits}`);
              }

                if (data.pagerdutyAlerts) {
                    sections.push(`## PAGERDUTY ALERTS / INCIDENT SIGNALS
                    ${data.pagerdutyAlerts}`);
                      }

                        if (data.slackMessages) {
                            sections.push(`## SLACK CHANNEL MESSAGES (incident channel)
                            ${data.slackMessages}`);
                              }

                                if (data.additionalContext) {
                                    sections.push(`## ADDITIONAL CONTEXT
                                    ${data.additionalContext}`);
                                      }

                                        sections.push(`## OUTPUT FORMAT INSTRUCTIONS

                                        Respond with a valid JSON object matching EXACTLY this structure (no markdown fences around the JSON):

                                        {
                                          "title": "string - concise incident title, no names",
                                            "severity": {
                                                "level": "P1|P2|P3",
                                                    "reasoning": "string - 2-3 sentences explaining the severity classification based on impact, duration, blast radius"
                                                      },
                                                        "summary": "string - 3-4 sentence executive summary of the incident, what happened, impact, and resolution",
                                                          "timeline": [
                                                              {
                                                                    "time": "HH:MM UTC",
                                                                          "event": "string - what happened, no names",
                                                                                "source": "GitHub|PagerDuty|Slack|System|Manual"
                                                                                    }
                                                                                      ],
                                                                                        "timelineGaps": [
                                                                                            {
                                                                                                  "from": "HH:MM UTC",
                                                                                                        "to": "HH:MM UTC",
                                                                                                              "durationMinutes": number,
                                                                                                                    "note": "string - what data is missing or unknown in this window"
                                                                                                                        }
                                                                                                                          ],
                                                                                                                            "rootCauseChain": "string - narrative description of the causal chain leading to the incident, written in terms of systems/processes/configurations, NOT individuals. Use language like 'A configuration change in X caused Y, which triggered Z...'",
                                                                                                                              "contributingFactors": [
                                                                                                                                  "string - each factor is a systemic issue, NOT a person's action"
                                                                                                                                    ],
                                                                                                                                      "whatWentWell": [
                                                                                                                                          "string - systems, processes, or responses that worked as intended"
                                                                                                                                            ],
                                                                                                                                              "whatWentWrong": [
                                                                                                                                                  "string - systems, processes, or tooling that failed or underperformed"
                                                                                                                                                    ],
                                                                                                                                                      "actionItems": [
                                                                                                                                                          {
                                                                                                                                                                "id": 1,
                                                                                                                                                                      "title": "string - clear, actionable task",
                                                                                                                                                                            "owner": "string - team or role (e.g., 'Platform Team', 'On-call Rotation', 'DevOps'), NEVER a person's name",
                                                                                                                                                                                  "dueDate": "string - relative date like '1 week', '2 weeks', '1 month'",
                                                                                                                                                                                        "priority": "high|medium|low"
                                                                                                                                                                                            }
                                                                                                                                                                                              ]
                                                                                                                                                                                              }
                                                                                                                                                                                              
                                                                                                                                                                                              RULES:
                                                                                                                                                                                              1. Timeline must be chronological
                                                                                                                                                                                              2. Flag any time gaps >15 minutes where data is unclear as timelineGaps  
                                                                                                                                                                                              3. Generate exactly 5 action items
                                                                                                                                                                                              4. Action item owners must be teams/roles, never individuals
                                                                                                                                                                                              5. contributingFactors: 3-5 items
                                                                                                                                                                                              6. whatWentWell: 3-5 items
                                                                                                                                                                                              7. whatWentWrong: 3-5 items
                                                                                                                                                                                              8. P1 = major outage, revenue impact, >30min; P2 = degraded performance or partial outage; P3 = minor issue, quick resolution
                                                                                                                                                                                              9. ABSOLUTELY NO individual names anywhere in the output
                                                                                                                                                                                              10. The JSON must be valid and parseable`);
                                                                                                                                                                                              
                                                                                                                                                                                                return sections.join('\n\n');
                                                                                                                                                                                                }
