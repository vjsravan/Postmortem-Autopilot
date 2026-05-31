import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildPrompt } from '@/lib/prompt';
import { parsePostmortem } from '@/lib/parser';
import { IncidentData } from '@/types';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

export async function POST(req: NextRequest) {
    try {
          const data: IncidentData = await req.json();

          if (!data.timeRange || !data.serviceName) {
                  return NextResponse.json(
                            { error: 'timeRange and serviceName are required' },
                            { status: 400 }
                          );
                }

          const prompt = buildPrompt(data);

          const message = await client.messages.create({
                  model: 'claude-opus-4-5',
                  max_tokens: 4096,
                  messages: [
                            {
                                        role: 'user',
                                        content: prompt,
                                      },
                          ],
                });

          const content = message.content[0];
          if (content.type !== 'text') {
                  throw new Error('Unexpected response type from Claude');
                }

          const parsed = parsePostmortem(content.text, data);
          return NextResponse.json(parsed);
        } catch (error: unknown) {
          console.error('Generation error:', error);
          return NextResponse.json(
                  { error: error instanceof Error ? error.message : 'Internal server error' },
                  { status: 500 }
                );
        }
  }
