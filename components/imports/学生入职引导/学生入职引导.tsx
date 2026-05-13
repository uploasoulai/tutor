import svgPaths from './svg-3cvtrxkbdd';

function Container1() {
  return (
    <div className="h-[27.5px] relative shrink-0 w-[25px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 27.5"
      >
        <g id="Container">
          <path d={svgPaths.p6b6a700} fill="var(--fill-0, #003461)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#003461] text-[20px] tracking-[-0.5px] whitespace-nowrap">
        <p className="leading-[28px]">Coastal AI</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center relative shrink-0"
      data-name="Container"
    >
      <Container1 />
      <Container2 />
    </div>
  );
}

function Button() {
  return (
    <div
      className="content-stretch flex items-center justify-center relative shrink-0"
      data-name="Button"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] text-center tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">{`Save & Exit`}</p>
      </div>
    </div>
  );
}

function GlobalNavSuppressedForLinearFlowMinimalLogoHeaderInstead() {
  return (
    <div
      className="content-stretch flex items-center justify-between max-w-[800px] relative shrink-0 w-full"
      data-name="Global Nav Suppressed for Linear Flow. Minimal Logo Header instead"
    >
      <Container />
      <Button />
    </div>
  );
}

function GlobalNavSuppressedForLinearFlowMinimalLogoHeaderInsteadMargin() {
  return (
    <div
      className="content-stretch flex flex-col items-start max-w-[800px] pb-[48px] relative shrink-0 w-[800px]"
      data-name="Global Nav Suppressed for Linear Flow. Minimal Logo Header instead:margin"
    >
      <GlobalNavSuppressedForLinearFlowMinimalLogoHeaderInstead />
    </div>
  );
}

function ProgressBar() {
  return (
    <div
      className="bg-[#e1e3e4] h-[8px] overflow-clip relative rounded-[9999px] shrink-0 w-full"
      data-name="Progress Bar"
    >
      <div
        className="absolute bg-[#003461] bottom-0 left-0 right-1/2 rounded-[9999px] top-0"
        data-name="Background"
      />
    </div>
  );
}

function ProgressBarMargin() {
  return (
    <div
      className="content-stretch flex flex-col h-[20px] items-start pb-[12px] relative shrink-0 w-full"
      data-name="Progress Bar:margin"
    >
      <ProgressBar />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[12.025px] relative shrink-0 w-[16.3px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16.3 12.025"
      >
        <g id="Container">
          <path d={svgPaths.p2f7dfa00} fill="var(--fill-0, #3F6D38)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div
      className="bg-[#b9eeab] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]"
      data-name="Background"
    >
      <Container4 />
    </div>
  );
}

function Heading1() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Step 1: Personal Profile</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Alex Johnson • Grade 11</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-[176.73px]"
      data-name="Container"
    >
      <Heading1 />
      <Container6 />
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative size-full">
        <Background />
        <Container5 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#003461] text-[14px] text-center tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Edit</p>
        </div>
      </div>
    </div>
  );
}

function Step1CompletedStateCollapsed() {
  return (
    <div
      className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] opacity-80 relative rounded-[12px] shrink-0 w-full"
      data-name="STEP 1: Completed State (Collapsed)"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[25px] relative size-full">
          <Container3 />
          <Button1 />
        </div>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div
      className="bg-[#003461] content-stretch flex items-center justify-center pb-[6.5px] pt-[5.5px] relative rounded-[9999px] shrink-0 size-[40px]"
      data-name="Background"
    >
      <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[20px] text-center text-white whitespace-nowrap">
        <p className="leading-[28px]">2</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#191c1d] text-[32px] whitespace-nowrap">
        <p className="leading-[40px]">Select your Subjects</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full"
      data-name="Container"
    >
      <Background1 />
      <Heading />
    </div>
  );
}

function Container9() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] w-full">
        <p className="leading-[24px]">{`Choose the courses you're focusing on. We've filtered these based on the BC Grade 11 Curriculum.`}</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container8 />
        <Container9 />
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="relative shrink-0 size-[42px]" data-name="Background">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 42 42"
      >
        <g id="Background">
          <rect fill="var(--fill-0, #004B87)" height="42" rx="8" width="42" />
          <path d={svgPaths.p14a4f218} fill="var(--fill-0, #8ABCFF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative size-full">
        <Background2 />
        <div className="relative shrink-0 size-[20px]" data-name="Icon">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 20 20"
          >
            <path d={svgPaths.p7b061c0} fill="var(--fill-0, #003461)" id="Icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
          <p className="leading-[20px]">Pre-Calculus 11</p>
        </div>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] w-full">
          <p className="leading-[16px]">Core Math Requirement</p>
        </div>
      </div>
    </div>
  );
}

function LabelSubjectCardSelected() {
  return (
    <div
      className="bg-[rgba(0,75,135,0.05)] col-1 justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0"
      data-name="Label - Subject Card (Selected)"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-[#003461] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[26px] relative size-full">
        <Container10 />
        <Heading2 />
        <Container11 />
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="h-[42px] relative shrink-0 w-[42.057px]" data-name="Background">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 42.057 42"
      >
        <g id="Background">
          <rect fill="var(--fill-0, #E1E3E4)" height="42" rx="8" width="42.057" />
          <path d={svgPaths.p18170e00} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative size-full">
        <Background3 />
        <div className="relative shrink-0 size-[20px]" data-name="Icon">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 32 32"
          >
            <g id="Icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
          <p className="leading-[20px]">Chemistry 11</p>
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] w-full">
          <p className="leading-[16px]">Science Elective</p>
        </div>
      </div>
    </div>
  );
}

function LabelSubjectCardUnselected() {
  return (
    <div
      className="bg-[#f8f9fa] col-2 justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0"
      data-name="Label - Subject Card (Unselected)"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[26px] relative size-full">
        <Container12 />
        <Heading3 />
        <Container13 />
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="h-[44px] relative shrink-0 w-[40px]" data-name="Background">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 40 44"
      >
        <g id="Background">
          <rect fill="var(--fill-0, #E1E3E4)" height="44" rx="8" width="40" />
          <path d={svgPaths.p197852c0} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative size-full">
        <Background4 />
        <div className="relative shrink-0 size-[20px]" data-name="Icon">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 32 32"
          >
            <g id="Icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
          <p className="leading-[20px]">English First Peoples 11</p>
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] w-full">
          <p className="leading-[16px]">Language Arts</p>
        </div>
      </div>
    </div>
  );
}

function LabelSubjectCardUnselected1() {
  return (
    <div
      className="bg-[#f8f9fa] col-3 justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0"
      data-name="Label - Subject Card (Unselected)"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[26px] relative size-full">
        <Container14 />
        <Heading4 />
        <Container15 />
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="h-[43px] relative shrink-0 w-[38px]" data-name="Background">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 38 43"
      >
        <g id="Background">
          <rect fill="var(--fill-0, #E1E3E4)" height="43" rx="8" width="38" />
          <path d={svgPaths.p3c9782d0} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[36px] relative shrink-0 w-[20px]" data-name="Margin">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 36"
      >
        <g id="Margin">
          <g id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative size-full">
        <Background5 />
        <Margin />
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
          <p className="leading-[20px]">AP Biology</p>
        </div>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] w-full">
          <p className="leading-[16px]">Advanced Placement</p>
        </div>
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div
      className="absolute bg-[#3b6934] right-[2.02px] rounded-bl-[8px] top-[2px]"
      data-name="Background"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[8px] py-[4px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap">
          <p className="leading-[15px]">AP</p>
        </div>
      </div>
    </div>
  );
}

function LabelSubjectCardUnselectedAp() {
  return (
    <div
      className="bg-[#f8f9fa] col-1 justify-self-stretch relative rounded-[12px] row-2 self-start shrink-0"
      data-name="Label - Subject Card (Unselected - AP)"
    >
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[4px] items-start p-[26px] relative size-full">
          <Container16 />
          <Heading5 />
          <Container17 />
          <Background6 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border-2 border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
    </div>
  );
}

function Background7() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="Background">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 44 44"
      >
        <g id="Background">
          <rect fill="var(--fill-0, #004B87)" height="44" rx="8" width="44" />
          <path d={svgPaths.p3a019b83} fill="var(--fill-0, #8ABCFF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative size-full">
        <Background7 />
        <div className="relative shrink-0 size-[20px]" data-name="Icon">
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 20 20"
          >
            <path d={svgPaths.p7b061c0} fill="var(--fill-0, #003461)" id="Icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
          <p className="leading-[20px]">Social Studies 11</p>
        </div>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] w-full">
          <p className="leading-[16px]">Explorations</p>
        </div>
      </div>
    </div>
  );
}

function LabelSubjectCardSelected1() {
  return (
    <div
      className="bg-[rgba(0,75,135,0.05)] col-2 justify-self-stretch relative rounded-[12px] row-2 self-start shrink-0"
      data-name="Label - Subject Card (Selected)"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-[#003461] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[26px] relative size-full">
        <Container18 />
        <Heading6 />
        <Container19 />
      </div>
    </div>
  );
}

function BentoGridForSubjectSelection() {
  return (
    <div className="relative shrink-0 w-full" data-name="Bento Grid for Subject Selection">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[__152px_152px] pb-[24px] relative size-full">
        <LabelSubjectCardSelected />
        <LabelSubjectCardUnselected />
        <LabelSubjectCardUnselected1 />
        <LabelSubjectCardUnselectedAp />
        <LabelSubjectCardSelected1 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
      >
        <g id="Container">
          <path d={svgPaths.p1a406200} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#003461] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center px-[80px] py-[12px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Continue to Goals</p>
        </div>
        <Container20 />
      </div>
    </div>
  );
}

function ActionButton() {
  return (
    <div className="relative shrink-0 w-full" data-name="Action Button">
      <div
        aria-hidden="true"
        className="absolute border-[#c2c6d1] border-solid border-t inset-0 pointer-events-none"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-end pt-[25px] relative size-full">
        <Button2 />
      </div>
    </div>
  );
}

function Step2ActiveStateExpanded() {
  return (
    <div
      className="bg-white drop-shadow-[0px_4px_6px_rgba(0,43,135,0.08)] relative rounded-[12px] shrink-0 w-full"
      data-name="STEP 2: Active State (Expanded)"
    >
      <div
        aria-hidden="true"
        className="absolute border-[#003461] border-solid border-t-4 inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[48px] pt-[52px] px-[48px] relative size-full">
        <Container7 />
        <BentoGridForSubjectSelection />
        <ActionButton />
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div
      className="bg-[#e1e3e4] relative rounded-[9999px] shrink-0 size-[40px]"
      data-name="Background"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pb-[6.5px] pt-[5.5px] relative size-full">
        <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#424750] text-[20px] text-center whitespace-nowrap">
          <p className="leading-[28px]">3</p>
        </div>
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Daily Learning Goal</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Set your pace for success.</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 w-[188.02px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading7 />
        <Container22 />
      </div>
    </div>
  );
}

function Step3UpcomingStateCollapsed() {
  return (
    <div
      className="bg-[#f8f9fa] opacity-60 relative rounded-[12px] shrink-0 w-full"
      data-name="STEP 3: Upcoming State (Collapsed)"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[24px] items-center p-[25px] relative size-full">
          <Background8 />
          <Container21 />
        </div>
      </div>
    </div>
  );
}

function Background9() {
  return (
    <div
      className="bg-[#e1e3e4] relative rounded-[9999px] shrink-0 size-[40px]"
      data-name="Background"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pb-[6.5px] pt-[5.5px] relative size-full">
        <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#424750] text-[20px] text-center whitespace-nowrap">
          <p className="leading-[28px]">4</p>
        </div>
      </div>
    </div>
  );
}

function Heading8() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Team Up</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Invite parents or guardians (Optional).</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 w-[267.83px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading8 />
        <Container24 />
      </div>
    </div>
  );
}

function Step4UpcomingStateCollapsed() {
  return (
    <div
      className="bg-[#f8f9fa] opacity-60 relative rounded-[12px] shrink-0 w-full"
      data-name="STEP 4: Upcoming State (Collapsed)"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[24px] items-center p-[25px] relative size-full">
          <Background9 />
          <Container23 />
        </div>
      </div>
    </div>
  );
}

function MainWizardContainer() {
  return (
    <div
      className="content-stretch flex flex-col gap-[24px] items-start max-w-[800px] relative shrink-0 w-[800px]"
      data-name="Main Wizard Container"
    >
      <ProgressBarMargin />
      <Step1CompletedStateCollapsed />
      <Step2ActiveStateExpanded />
      <Step3UpcomingStateCollapsed />
      <Step4UpcomingStateCollapsed />
    </div>
  );
}

export default function Component() {
  return (
    <div
      className="content-stretch flex flex-col items-center pb-[86px] pt-[48px] px-[64px] relative size-full"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(243, 244, 245) 0%, rgb(243, 244, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
      }}
      data-name="学生入职引导"
    >
      <GlobalNavSuppressedForLinearFlowMinimalLogoHeaderInsteadMargin />
      <MainWizardContainer />
    </div>
  );
}
