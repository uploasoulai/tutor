export type LessonWidget =
  | {
      kind: 'ten-frame';
      target: number;
      max: number;
      prompt: string;
    }
  | {
      kind: 'number-line';
      min: number;
      max: number;
      step: number;
      target: number;
      prompt: string;
    }
  | {
      kind: 'choice-card';
      prompt: string;
      choices: string[];
      correctChoice: string;
    };

export function buildGrade2MathWidgets(topic: string): LessonWidget[] {
  return [
    {
      kind: 'ten-frame',
      target: 7,
      max: 10,
      prompt: `Build a quick picture for ${topic}. Tap counters until the model matches the story.`,
    },
    {
      kind: 'number-line',
      min: 0,
      max: 100,
      step: 10,
      target: 70,
      prompt: `Slide along the number line and stop near the useful benchmark for ${topic}.`,
    },
    {
      kind: 'choice-card',
      prompt: `Pick the strategy that makes ${topic} visible.`,
      choices: ['Draw it', 'Use objects', 'Guess silently'],
      correctChoice: 'Draw it',
    },
  ];
}

export function getFallbackLessonWidget(index: number, topic: string): LessonWidget {
  const widgets = buildGrade2MathWidgets(topic);
  return widgets[index] ?? widgets[widgets.length - 1];
}

export function evaluateWidgetResult(widget: LessonWidget, value: number | string) {
  if (widget.kind === 'ten-frame') {
    return Number(value) === widget.target;
  }

  if (widget.kind === 'number-line') {
    return Math.abs(Number(value) - widget.target) <= widget.step;
  }

  return String(value) === widget.correctChoice;
}

export function calculateWidgetXp(isCorrect: boolean) {
  return isCorrect ? 6 : 2;
}
