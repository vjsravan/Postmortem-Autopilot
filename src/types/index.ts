export interface IncidentData {
  timeRange: string;
    serviceName: string;
      githubCommits?: string;
        pagerdutyAlerts?: string;
          slackMessages?: string;
            additionalContext?: string;
            }

            export interface TimelineEvent {
              time: string;
                event: string;
                  source: string;
                    gap?: boolean;
                      gapNote?: string;
                      }

                      export interface ActionItem {
                        id: number;
                          title: string;
                            owner: string;
                              dueDate: string;
                                priority: 'high' | 'medium' | 'low';
                                }

                                export interface SeverityInfo {
                                  level: 'P1' | 'P2' | 'P3';
                                    reasoning: string;
                                      color: string;
                                      }

                                      export interface TimelineGap {
                                        from: string;
                                          to: string;
                                            durationMinutes: number;
                                              note: string;
                                              }

                                              export interface PostmortemResult {
                                                title: string;
                                                  severity: SeverityInfo;
                                                    summary: string;
                                                      timeline: TimelineEvent[];
                                                        timelineGaps: TimelineGap[];
                                                          rootCauseChain: string;
                                                            contributingFactors: string[];
                                                              whatWentWell: string[];
                                                                whatWentWrong: string[];
                                                                  actionItems: ActionItem[];
                                                                    markdown: string;
                                                                      confluenceFormat: string;
                                                                        rawInput: IncidentData;
                                                                          generatedAt: string;
                                                                          }
