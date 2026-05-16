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
      kind: 'place-value-builder';
      target: number;
      tens: number;
      ones: number;
      prompt: string;
    }
  | {
      kind: 'matching-pairs';
      prompt: string;
      pairs: { left: string; right: string }[];
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
      kind: 'place-value-builder',
      target: 73,
      tens: 7,
      ones: 3,
      prompt: `Build a base-ten model for ${topic}. Choose tens and ones, then check the total.`,
    },
    {
      kind: 'matching-pairs',
      prompt: `Match the ${topic} representation to the strategy it shows.`,
      pairs: [
        { left: '7 tens and 3 ones', right: '73' },
        { left: '70 + 3', right: '73' },
        { left: 'Count by tens, then ones', right: 'Place value strategy' },
      ],
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

  if (widget.kind === 'place-value-builder') {
    return Number(value) === widget.target;
  }

  if (widget.kind === 'matching-pairs') {
    return Number(value) >= widget.pairs.length;
  }

  return String(value) === widget.correctChoice;
}

export function calculateWidgetXp(isCorrect: boolean) {
  return isCorrect ? 6 : 2;
}
