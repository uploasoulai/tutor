import svgPaths from './svg-aplrhafydl';

function Heading1() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#191c1d] text-[32px] w-full">
        <p className="leading-[40px]">Welcome back, Alex.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[18px] w-full">
        <p className="leading-[28px]">Here is your learning summary for today.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading1 />
      <Container1 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[16.667px] relative shrink-0 w-[15.843px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 15.8431 16.6667"
      >
        <g id="Container">
          <path d={svgPaths.p23f73180} fill="var(--fill-0, #793701)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#793701] text-[14px] tracking-[0.7px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">AI SMART PATH</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div
      className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full"
      data-name="Container"
    >
      <Container4 />
      <Container5 />
    </div>
  );
}

function Heading2() {
  return (
    <div
      className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#191c1d] text-[20px] w-full">
        <p className="leading-[28px]">Next Step: Calculus Integrals</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div
      className="content-stretch flex flex-col items-start max-w-[512px] relative shrink-0 w-[512px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px] mb-0">{`You've mastered derivatives! Let's move on to integrating complex`}</p>
        <p className="leading-[24px] mb-0">
          functions. This module aligns with your upcoming AP exam prep
        </p>
        <p className="leading-[24px]">schedule.</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container3 />
        <Heading2 />
        <Container6 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
      >
        <g id="Container">
          <path d={svgPaths.p304eaa0} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div
      className="bg-[#003461] content-stretch flex gap-[4px] items-center pb-[13.5px] pt-[12.5px] px-[24px] relative rounded-[8px] shrink-0"
      data-name="Button"
    >
      <div
        className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
        data-name="Button:shadow"
      />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Start Lesson</p>
      </div>
      <Container8 />
    </div>
  );
}

function Button1() {
  return (
    <div
      className="content-stretch flex flex-col items-center justify-center px-[25px] py-[13px] relative rounded-[8px] shrink-0"
      data-name="Button"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#727781] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] text-center tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Review Notes</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Button />
      <Button1 />
    </div>
  );
}

function Margin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[24px] relative size-full">
        <Container7 />
      </div>
    </div>
  );
}

function AiSmartPathHeroComponent() {
  return (
    <div
      className="bg-white col-[1/span_8] justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0"
      data-name="AI Smart Path (Hero Component)"
    >
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start justify-between pl-[28px] pr-[24px] py-[24px] relative size-full">
          <Container2 />
          <div
            className="absolute bg-[#d3e4ff] blur-[32px] opacity-30 right-[-64px] rounded-[9999px] size-[256px] top-[-64px]"
            data-name="Background+Blur"
          />
          <Margin />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border-[#003461] border-l-4 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_4px_12px_0px_rgba(0,43,135,0.08)]"
      />
    </div>
  );
}

function Heading3() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] w-full">
        <p className="leading-[20px]">Daily Goal</p>
      </div>
    </div>
  );
}

function Heading3Margin() {
  return (
    <div
      className="absolute content-stretch flex flex-col items-start left-[24px] pb-[24px] right-[24px] top-[24px]"
      data-name="Heading 3:margin"
    >
      <Heading3 />
    </div>
  );
}

function Container9() {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col items-center left-1/2 pl-[3.55px] pr-[3.56px] top-[calc(50%+92px)]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] text-center whitespace-nowrap">
        <p className="leading-[24px] mb-0">15 mins remaining to reach your</p>
        <p className="leading-[24px]">goal.</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="relative shrink-0" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center leading-[0] relative size-full text-center whitespace-nowrap">
        <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center relative shrink-0 text-[#191c1d] text-[32px]">
          <p className="leading-[40px]">45</p>
        </div>
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center not-italic relative shrink-0 text-[#424750] text-[12px]">
          <p className="leading-[16px]">mins</p>
        </div>
      </div>
    </div>
  );
}

function MockCircularProgress() {
  return (
    <div
      className="content-stretch flex items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[128px]"
      data-name="Mock Circular Progress"
    >
      <div
        aria-hidden="true"
        className="absolute border-8 border-[#edeeef] border-solid inset-0 pointer-events-none rounded-[9999px]"
      />
      <Paragraph />
      <div
        className="absolute flex inset-[-15.2px_-15.2px_-15.19px_-15.2px] items-center justify-center"
        style={{ containerType: 'size' }}
      >
        <div className="flex-none h-[hypot(-50cqw,50cqh)] rotate-45 w-[hypot(50cqw,50cqh)]">
          <div className="relative rounded-[9999px] size-full" data-name="Border">
            <div
              aria-hidden="true"
              className="absolute border-8 border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[9999px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockCircularProgressMargin() {
  return (
    <div
      className="absolute content-stretch flex flex-col h-[140px] items-start left-[77.33px] pb-[12px] top-[68px] w-[128px]"
      data-name="Mock Circular Progress:margin"
    >
      <MockCircularProgress />
    </div>
  );
}

function DailyGoalTracking() {
  return (
    <div
      className="bg-white col-[9/span_4] drop-shadow-[0px_4px_6px_rgba(0,43,135,0.08)] h-[280px] justify-self-stretch relative rounded-[12px] row-1 shrink-0"
      data-name="Daily Goal Tracking"
    >
      <Heading3Margin />
      <Container9 />
      <MockCircularProgressMargin />
    </div>
  );
}

function Heading4() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Subject Mastery</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#003461] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">View Details</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pr-[0.01px] relative size-full">
          <Heading4 />
          <Link />
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">AP Calculus BC</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">82%</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative size-full">
        <Container13 />
        <Container14 />
      </div>
    </div>
  );
}

function Background() {
  return (
    <div
      className="bg-[#e7e8e9] h-[8px] relative rounded-[9999px] shrink-0 w-full"
      data-name="Background"
    >
      <div
        className="absolute bg-[#003461] h-[8px] left-0 right-[18%] rounded-[9999px] top-0"
        data-name="Background"
      />
    </div>
  );
}

function Math() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full"
      data-name="Math"
    >
      <Container12 />
      <Background />
    </div>
  );
}

function Container16() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Physics 12</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">65%</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between pr-[0.01px] relative size-full">
        <Container16 />
        <Container17 />
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div
      className="bg-[#e7e8e9] h-[8px] relative rounded-[9999px] shrink-0 w-full"
      data-name="Background"
    >
      <div
        className="absolute bg-[#3b6934] h-[8px] left-0 right-[35%] rounded-[9999px] top-0"
        data-name="Background"
      />
    </div>
  );
}

function Science() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full"
      data-name="Science"
    >
      <Container15 />
      <Background1 />
    </div>
  );
}

function Container19() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">English Lit</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">90%</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div
      className="content-stretch flex h-[20px] items-start justify-between relative shrink-0 w-full"
      data-name="Container"
    >
      <Container19 />
      <Container20 />
    </div>
  );
}

function Background2() {
  return (
    <div
      className="bg-[#e7e8e9] h-[8px] relative rounded-[9999px] shrink-0 w-full"
      data-name="Background"
    >
      <div
        className="absolute bg-[#793701] h-[8px] left-0 right-[10%] rounded-[9999px] top-0"
        data-name="Background"
      />
    </div>
  );
}

function Literature() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full"
      data-name="Literature"
    >
      <Container18 />
      <Background2 />
    </div>
  );
}

function Container11() {
  return (
    <div
      className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Math />
      <Science />
      <Literature />
    </div>
  );
}

function SubjectMasteryProgress() {
  return (
    <div
      className="bg-white col-[1/span_7] drop-shadow-[0px_4px_6px_rgba(0,43,135,0.08)] justify-self-stretch relative rounded-[12px] row-2 self-start shrink-0"
      data-name="Subject Mastery Progress"
    >
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full">
        <Container10 />
        <Container11 />
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] w-full">
        <p className="leading-[20px]">Upcoming AP Prep</p>
      </div>
    </div>
  );
}

function Heading3Margin1() {
  return (
    <div
      className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0 w-full"
      data-name="Heading 3:margin"
    >
      <Heading5 />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[18px] relative shrink-0 w-[18.057px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 18.057 18"
      >
        <g id="Container">
          <path d={svgPaths.p269eed00} fill="var(--fill-0, #3F6D38)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background3() {
  return (
    <div
      className="bg-[#b9eeab] relative rounded-[9999px] shrink-0 size-[40px]"
      data-name="Background"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container21 />
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 4"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Physics Mock Exam</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">Tomorrow, 10:00 AM</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative self-stretch shrink-0 w-[136.88px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading6 />
        <Container23 />
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[8px] shrink-0 w-full" data-name="Item">
      <div
        aria-hidden="true"
        className="absolute border border-[#e7e8e9] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
      <div className="content-stretch flex gap-[12px] items-start p-[13px] relative size-full">
        <Background3 />
        <Container22 />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[16px] relative shrink-0 w-[12px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 16"
      >
        <g id="Container">
          <path d={svgPaths.p3a4b4500} fill="var(--fill-0, #001C38)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background4() {
  return (
    <div
      className="bg-[#d3e4ff] relative rounded-[9999px] shrink-0 size-[40px]"
      data-name="Background"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container24 />
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 4"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Calculus Review Session</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">Friday, 3:30 PM</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative self-stretch shrink-0 w-[171.14px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading7 />
        <Container26 />
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[8px] shrink-0 w-full" data-name="Item">
      <div
        aria-hidden="true"
        className="absolute border border-[#e7e8e9] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
      <div className="content-stretch flex gap-[12px] items-start p-[13px] relative size-full">
        <Background4 />
        <Container25 />
      </div>
    </div>
  );
}

function List() {
  return (
    <div
      className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full"
      data-name="List"
    >
      <Item />
      <Item1 />
    </div>
  );
}

function UpcomingRecent() {
  return (
    <div
      className="bg-white col-[8/span_5] drop-shadow-[0px_4px_6px_rgba(0,43,135,0.08)] justify-self-stretch relative rounded-[12px] row-2 self-start shrink-0"
      data-name="Upcoming & Recent"
    >
      <div className="content-stretch flex flex-col items-start p-[24px] relative size-full">
        <Heading3Margin1 />
        <List />
      </div>
    </div>
  );
}

function BentoGridLayout() {
  return (
    <div
      className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[__280px_236px] relative shrink-0 w-full"
      data-name="Bento Grid Layout"
    >
      <AiSmartPathHeroComponent />
      <DailyGoalTracking />
      <SubjectMasteryProgress />
      <UpcomingRecent />
    </div>
  );
}

function DashboardCanvas() {
  return (
    <div
      className="absolute content-stretch flex flex-col gap-[24px] inset-[65px_0_189px_0] items-start max-w-[1280px] p-[64px]"
      data-name="Dashboard Canvas"
    >
      <Container />
      <BentoGridLayout />
    </div>
  );
}

function Container28() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#003461] text-[20px] whitespace-nowrap">
        <p className="leading-[28px]">Coastal AI</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">
          © 2024 Coastal AI Academy. Aligned with BC Ministry of Education Standards.
        </p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Link"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Privacy Policy</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Link"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Support</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div
      className="content-stretch flex gap-[24px] h-[24px] items-start relative shrink-0"
      data-name="Container"
    >
      <Link1 />
      <Link2 />
    </div>
  );
}

function Container27() {
  return (
    <div className="max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between max-w-[inherit] px-[64px] py-[80px] relative size-full">
          <Container28 />
          <Container29 />
          <Container30 />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div
      className="absolute bg-[#e1e3e4] bottom-0 content-stretch flex flex-col items-start left-0 pt-px right-0"
      data-name="Footer"
    >
      <div
        aria-hidden="true"
        className="absolute border-[#c2c6d1] border-solid border-t inset-0 pointer-events-none"
      />
      <Container27 />
    </div>
  );
}

function Link3() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Link"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Courses</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Link"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Tutoring</p>
      </div>
    </div>
  );
}

function Link5() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative self-stretch shrink-0"
      data-name="Link"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Library</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div
      className="content-stretch flex gap-[24px] h-[20px] items-start relative shrink-0"
      data-name="Container"
    >
      <Link3 />
      <Link4 />
      <Link5 />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16 20"
      >
        <g id="Container">
          <path d={svgPaths.p164b49c0} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div
      className="content-stretch flex flex-col items-center justify-center p-[4px] relative rounded-[9999px] shrink-0"
      data-name="Button"
    >
      <Container34 />
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[16px] relative shrink-0 w-[19.5px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 19.5 16"
      >
        <g id="Container">
          <path d={svgPaths.p29002e00} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div
      className="content-stretch flex flex-col items-center justify-center p-[4px] relative rounded-[9999px] shrink-0"
      data-name="Button"
    >
      <Container35 />
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Container">
          <path d={svgPaths.p3de21300} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div
      className="content-stretch flex flex-col items-center justify-center p-[4px] relative rounded-[9999px] shrink-0"
      data-name="Button"
    >
      <Container36 />
    </div>
  );
}

function Container33() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center relative shrink-0"
      data-name="Container"
    >
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[64px] max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between max-w-[inherit] px-[64px] relative size-full">
          <Container32 />
          <Container33 />
        </div>
      </div>
    </div>
  );
}

function HeaderTopNavBar() {
  return (
    <div
      className="absolute bg-white content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-start left-0 pb-px right-0 top-0"
      data-name="Header - TopNavBar"
    >
      <div
        aria-hidden="true"
        className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none"
      />
      <Container31 />
    </div>
  );
}

function MainContentWrapper() {
  return (
    <div
      className="flex-[1_0_0] min-h-[1024px] min-w-px relative self-stretch"
      data-name="Main Content Wrapper"
    >
      <DashboardCanvas />
      <Footer />
      <HeaderTopNavBar />
    </div>
  );
}

function Heading() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 1"
    >
      <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#003461] text-[20px] w-full">
        <p className="leading-[28px]">Student Portal</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] w-full">
        <p className="leading-[16px]">Grade 11 • BC Curriculum</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[12px] relative size-full">
        <Heading />
        <Container38 />
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[48px] relative size-full">
        <Container37 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 18 18"
      >
        <g id="Container">
          <path d={svgPaths.p191dcc80} fill="var(--fill-0, #003461)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container40() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#003461] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Dashboard</p>
      </div>
    </div>
  );
}

function ItemActiveDashboardLink() {
  return (
    <div
      className="absolute bg-[rgba(0,75,135,0.1)] content-stretch flex gap-[12px] items-center left-[4px] p-[12px] right-[-4px] rounded-[8px] top-0"
      data-name="Item - Active: Dashboard → Link"
    >
      <Container39 />
      <Container40 />
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[18px] relative shrink-0 w-[22px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 22 18"
      >
        <g id="Container">
          <path d={svgPaths.pb257040} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container42() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">My Learning</p>
      </div>
    </div>
  );
}

function ItemLink() {
  return (
    <div
      className="absolute content-stretch flex gap-[12px] items-center left-0 p-[12px] right-0 rounded-[8px] top-[60px]"
      data-name="Item → Link"
    >
      <Container41 />
      <Container42 />
    </div>
  );
}

function Container43() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 22 22"
      >
        <g id="Container">
          <path d={svgPaths.p11c2d500} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container44() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">AP Prep</p>
      </div>
    </div>
  );
}

function ItemLink1() {
  return (
    <div
      className="absolute content-stretch flex gap-[12px] items-center left-0 p-[12px] right-0 rounded-[8px] top-[120px]"
      data-name="Item → Link"
    >
      <Container43 />
      <Container44 />
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[18px] relative shrink-0 w-[20px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 18"
      >
        <g id="Container">
          <path d={svgPaths.p3c508c40} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container46() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Mastery Reports</p>
      </div>
    </div>
  );
}

function ItemLink2() {
  return (
    <div
      className="absolute content-stretch flex gap-[12px] items-center left-0 p-[12px] right-0 rounded-[8px] top-[180px]"
      data-name="Item → Link"
    >
      <Container45 />
      <Container46 />
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[12px] relative shrink-0 w-[24px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 12"
      >
        <g id="Container">
          <path d={svgPaths.p5df3d80} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container48() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Community</p>
      </div>
    </div>
  );
}

function ItemLink3() {
  return (
    <div
      className="absolute content-stretch flex gap-[12px] items-center left-0 p-[12px] right-0 rounded-[8px] top-[240px]"
      data-name="Item → Link"
    >
      <Container47 />
      <Container48 />
    </div>
  );
}

function List1() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="List">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <ItemActiveDashboardLink />
        <ItemLink />
        <ItemLink1 />
        <ItemLink2 />
        <ItemLink3 />
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[15px] relative shrink-0 w-[14.259px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14.2588 15"
      >
        <g id="Container">
          <path d={svgPaths.p27681c00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div
      className="bg-[#003461] content-stretch flex gap-[4px] items-center justify-center py-[12px] relative rounded-[8px] shrink-0 w-full"
      data-name="Button"
    >
      <div
        className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
        data-name="Button:shadow"
      />
      <Container50 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Start AI Tutor</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Container">
          <path d={svgPaths.p2816f2c0} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container52() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Help Center</p>
      </div>
    </div>
  );
}

function ItemLink4() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Item → Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container51 />
          <Container52 />
        </div>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20.1 20"
      >
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container54() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Settings</p>
      </div>
    </div>
  );
}

function ItemLink5() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Item → Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container53 />
          <Container54 />
        </div>
      </div>
    </div>
  );
}

function List2() {
  return (
    <div
      className="content-stretch flex flex-col gap-[12px] items-start pt-[13px] relative shrink-0 w-full"
      data-name="List"
    >
      <div
        aria-hidden="true"
        className="absolute border-[#c2c6d1] border-solid border-t inset-0 pointer-events-none"
      />
      <ItemLink4 />
      <ItemLink5 />
    </div>
  );
}

function Container49() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start pt-[48px] relative size-full">
        <Button5 />
        <List2 />
      </div>
    </div>
  );
}

function SideNavBarDesktop() {
  return (
    <div
      className="absolute bg-[#f8f9fa] content-stretch flex flex-col h-[1024px] items-start justify-between left-0 pl-[12px] pr-[13px] py-[24px] top-0 w-[256px]"
      data-name="SideNavBar (Desktop)"
    >
      <div
        aria-hidden="true"
        className="absolute border-[#c2c6d1] border-r border-solid inset-0 pointer-events-none"
      />
      <Margin1 />
      <List1 />
      <Container49 />
    </div>
  );
}

export default function Component() {
  return (
    <div
      className="content-stretch flex items-start justify-center pl-[256px] relative size-full"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(248, 249, 250) 0%, rgb(248, 249, 250) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
      }}
      data-name="学生核心仪表盘探索"
    >
      <MainContentWrapper />
      <SideNavBarDesktop />
    </div>
  );
}
