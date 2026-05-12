import svgPaths from "./svg-5mk4g4p1u9";
import imgTeacherProfile from "../教师干预仪表盘与班级分析/f33309d8aaa31a36bfccc119a1b1af67e86387ee.png";
import imgStudentProfile from "../教师干预仪表盘与班级分析/a9476805aeb64af1f50578175e2ef771e361100c.png";
import imgStudentProfile1 from "../教师干预仪表盘与班级分析/b36b744d20165481692eaad119e39286b453ec01.png";
import imgMayaLin from "../教师干预仪表盘与班级分析/4f14253d9a1700ec7f6f6f98020169ef5d599bdf.png";

function Heading1() {
  return (
    <div className="relative shrink-0" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#191c1d] text-[20px] whitespace-nowrap">
          <p className="leading-[28px]">Intervention Overview</p>
        </div>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e1e3e4] content-stretch flex flex-col items-start px-[12px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">Pre-Calculus 11 • Block A</p>
      </div>
    </div>
  );
}

function TeacherProfile() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="Teacher Profile">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgTeacherProfile} />
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#004b87] content-stretch flex items-center justify-center overflow-clip relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[40px]" data-name="Background+Shadow">
      <TeacherProfile />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative size-full">
        <Background />
        <BackgroundShadow />
      </div>
    </div>
  );
}

function TopAppBarMobileContextDesktopHeader() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative shrink-0 w-full z-[2]" data-name="Top App Bar (Mobile Context / Desktop Header)">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[13px] pt-[12px] px-[64px] relative size-full">
          <Heading1 />
          <Container />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[19px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19">
        <g id="Container">
          <path d={svgPaths.p7555480} fill="var(--fill-0, #BA1A1A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Heading 3">
      <Container4 />
      <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#191c1d] text-[20px] whitespace-nowrap">
        <p className="leading-[28px]">Priority Interventions</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">AI-identified students requiring immediate support.</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[356.05px]" data-name="Container">
      <Heading2 />
      <Container5 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 w-full" data-name="Container">
      <Container3 />
    </div>
  );
}

function StudentProfile() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Student Profile">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-4.86%] max-w-none top-0 w-[109.71%]" src={imgStudentProfile} />
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#e1e3e4] content-stretch flex flex-col h-[48px] items-start justify-center overflow-clip relative rounded-[9999px] shrink-0 w-[43.75px]" data-name="Background">
      <StudentProfile />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Maya Lin</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] whitespace-nowrap">
        <p className="leading-[16px] mb-0">Grade 11 • At</p>
        <p className="leading-[16px]">Risk</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[73.17px]" data-name="Container">
      <Heading3 />
      <Container11 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <Background1 />
      <Container10 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#ffdad6] content-stretch flex flex-col items-start pl-[8px] pr-[27.07px] py-[4px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#93000a] text-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px] mb-0">CONCEPT</p>
        <p className="leading-[15px]">GAP</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Background2 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[16px] w-full">
        <p className="leading-[24px] mb-0">Consistently struggling with</p>
        <p className="mb-0">
          <span className="font-['Nimbus_Sans:Bold',sans-serif] leading-[24px] not-italic text-[#ba1a1a]">Factoring Polynomials</span>
          <span className="leading-[24px]">. Failed</span>
        </p>
        <p className="leading-[24px]">last 2 formative quizzes.</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative size-full">
        <Container8 />
        <Container12 />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#e7e8e9] content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-w-px py-[12px] relative rounded-[8px]" data-name="Button">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] text-center tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Message</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[15px] relative shrink-0 w-[14.259px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.2588 15">
        <g id="Container">
          <path d={svgPaths.p27681c00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#003461] content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-[1_0_0] gap-[4px] items-center justify-center min-w-px py-[12px] relative rounded-[8px]" data-name="Button">
      <Container14 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Assign Tutor</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-start justify-center relative size-full">
        <Button />
        <Button1 />
      </div>
    </div>
  );
}

function AlertCard() {
  return (
    <div className="bg-[#f8f9fa] col-1 drop-shadow-[0px_4px_6px_rgba(0,43,135,0.08)] justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0" data-name="Alert Card 1">
      <div aria-hidden="true" className="absolute border-[#ba1a1a] border-solid border-t-4 inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start justify-between pb-[24px] pt-[28px] px-[24px] relative size-full">
        <Container7 />
        <Container13 />
      </div>
    </div>
  );
}

function StudentProfile1() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Student Profile">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-9.7%] max-w-none top-0 w-[119.4%]" src={imgStudentProfile1} />
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#e1e3e4] content-stretch flex flex-col h-[48px] items-start justify-center overflow-clip relative rounded-[9999px] shrink-0 w-[40.2px]" data-name="Background">
      <StudentProfile1 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">David Chen</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] whitespace-nowrap">
        <p className="leading-[16px] mb-0">Grade 11 •</p>
        <p className="leading-[16px]">Warning</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[79.2px]" data-name="Container">
      <Heading4 />
      <Container19 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex gap-[12px] items-center mr-[-0.01px] relative shrink-0" data-name="Container">
      <Background3 />
      <Container18 />
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#793701] content-stretch flex flex-col items-start px-[8px] py-[4px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#ffa46a] text-[10px] tracking-[0.5px] uppercase whitespace-nowrap">
        <p className="leading-[15px]">ENGAGEMENT</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative size-full">
        <Container17 />
        <Background4 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[16px] w-full">
        <p className="leading-[24px] mb-0">Missed 3 consecutive</p>
        <p className="leading-[24px] mb-0">assignments. Last active on</p>
        <p className="leading-[24px]">platform 5 days ago.</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative size-full">
        <Container16 />
        <Container20 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[12px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 12">
        <g id="Container">
          <path d={svgPaths.p37f50280} fill="var(--fill-0, #191C1D)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#edeeef] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#727781] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center justify-center px-px py-[13px] relative size-full">
        <Container21 />
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] text-center tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Send Check-in</p>
        </div>
      </div>
    </div>
  );
}

function AlertCard1() {
  return (
    <div className="bg-[#f8f9fa] col-2 drop-shadow-[0px_4px_6px_rgba(0,43,135,0.08)] justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0" data-name="Alert Card 2">
      <div aria-hidden="true" className="absolute border-[#572500] border-solid border-t-4 inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start justify-between pb-[24px] pt-[28px] px-[24px] relative size-full">
        <Container15 />
        <Button2 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[_258px] relative shrink-0 w-full" data-name="Container">
      <AlertCard />
      <AlertCard1 />
    </div>
  );
}

function SectionAtRiskAlertsBentoGrid() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Section - At-Risk Alerts Bento Grid">
      <Container2 />
      <Container6 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#191c1d] text-[20px] whitespace-nowrap">
        <p className="leading-[28px]">BC Curriculum Mastery Heatmap</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Class-wide understanding of core competencies.</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[344.41px]" data-name="Container">
      <Heading5 />
      <Container24 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">Mastered</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center px-[8px] relative size-full">
        <div className="bg-[#3b6934] relative rounded-[9999px] shrink-0 size-[12px]" data-name="Background" />
        <Container26 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[12px] whitespace-nowrap">
          <p className="leading-[16px]">Developing</p>
        </div>
      </div>
    </div>
  );
}

function VerticalBorder() {
  return (
    <div className="relative shrink-0" data-name="VerticalBorder">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-l border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center pl-[9px] pr-[8px] relative size-full">
        <div className="bg-[#793701] relative rounded-[9999px] shrink-0 size-[12px]" data-name="Background" />
        <Container27 />
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[12px] whitespace-nowrap">
          <p className="leading-[16px]">Needs Support</p>
        </div>
      </div>
    </div>
  );
}

function VerticalBorder1() {
  return (
    <div className="relative shrink-0" data-name="VerticalBorder">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-l border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center pl-[9px] pr-[8px] relative size-full">
        <div className="bg-[#ba1a1a] relative rounded-[9999px] shrink-0 size-[12px]" data-name="Background" />
        <Container28 />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#f3f4f5] content-stretch flex gap-[12px] items-center p-[5px] relative rounded-[8px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container25 />
      <VerticalBorder />
      <VerticalBorder1 />
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container23 />
        <BackgroundBorder />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="col-[1/span_2] justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Unit / Concept</p>
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="col-3 justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] text-center tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Overall</p>
        </div>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="col-4 justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] text-center tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Quizzes</p>
        </div>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="col-5 justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] text-center tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">AI Tutor Metric</p>
        </div>
      </div>
    </div>
  );
}

function HeaderRow() {
  return (
    <div className="absolute gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(5,minmax(0,1fr))] grid-rows-[_20px] left-0 pb-[13px] right-0 top-0" data-name="Header Row">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none" />
      <Container29 />
      <Container30 />
      <Container31 />
      <Container32 />
    </div>
  );
}

function Container33() {
  return (
    <div className="col-[1/span_2] justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[16px] whitespace-nowrap">
          <p className="leading-[24px]">{`Real Numbers & Radicals`}</p>
        </div>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#3b6934] col-3 h-[32px] justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
          <p className="leading-[24px]">85%</p>
        </div>
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#a1d494] col-4 h-[32px] justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#002201] text-[16px] text-center whitespace-nowrap">
          <p className="leading-[24px]">82%</p>
        </div>
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#3b6934] col-5 h-[32px] justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
          <p className="leading-[24px]">88%</p>
        </div>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="absolute gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(5,minmax(0,1fr))] grid-rows-[_32px] left-0 pb-[13px] pt-[12px] right-0 top-[45px]" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none" />
      <Container33 />
      <Background5 />
      <Background6 />
      <Background7 />
    </div>
  );
}

function Container34() {
  return (
    <div className="col-[1/span_2] justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[16px] whitespace-nowrap">
          <p className="leading-[24px]">Polynomial Functions</p>
        </div>
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#ba1a1a] col-3 h-[32px] justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
          <p className="leading-[24px]">62%</p>
        </div>
      </div>
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#ffdad6] col-4 h-[32px] justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#93000a] text-[16px] text-center whitespace-nowrap">
          <p className="leading-[24px]">58%</p>
        </div>
      </div>
    </div>
  );
}

function Background10() {
  return (
    <div className="bg-[#793701] col-5 h-[32px] justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#ffa46a] text-[16px] text-center whitespace-nowrap">
          <p className="leading-[24px]">68%</p>
        </div>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="absolute gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(5,minmax(0,1fr))] grid-rows-[_32px] left-0 pb-[13px] pt-[12px] right-0 top-[102px]" data-name="Row 2">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none" />
      <Container34 />
      <Background8 />
      <Background9 />
      <Background10 />
    </div>
  );
}

function Container35() {
  return (
    <div className="col-[1/span_2] content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-center shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Quadratic Equations</p>
      </div>
    </div>
  );
}

function Background11() {
  return (
    <div className="bg-[#793701] col-3 content-stretch flex h-[32px] items-center justify-center justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#ffa46a] text-[16px] text-center whitespace-nowrap">
        <p className="leading-[24px]">74%</p>
      </div>
    </div>
  );
}

function Background12() {
  return (
    <div className="bg-[#572500] col-4 content-stretch flex h-[32px] items-center justify-center justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
        <p className="leading-[24px]">71%</p>
      </div>
    </div>
  );
}

function Background13() {
  return (
    <div className="bg-[#b9eeab] col-5 content-stretch flex h-[32px] items-center justify-center justify-self-stretch relative rounded-[4px] row-1 self-center shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3f6d38] text-[16px] text-center whitespace-nowrap">
        <p className="leading-[24px]">78%</p>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="absolute gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(5,minmax(0,1fr))] grid-rows-[_32px] left-0 py-[12px] right-0 top-[159px]" data-name="Row 3">
      <Container35 />
      <Background11 />
      <Background12 />
      <Background13 />
    </div>
  );
}

function HeatmapGrid() {
  return (
    <div className="h-[215px] min-w-[800px] relative shrink-0 w-full" data-name="Heatmap Grid">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-auto relative size-full">
        <HeaderRow />
        <Row />
        <Row1 />
        <Row2 />
      </div>
    </div>
  );
}

function SectionLearningGapHeatmapBcCurriculum() {
  return (
    <div className="bg-[#f8f9fa] drop-shadow-[0px_4px_6px_rgba(0,43,135,0.08)] relative rounded-[12px] shrink-0 w-full" data-name="Section - Learning Gap Heatmap (BC Curriculum)">
      <div aria-hidden="true" className="absolute border-[#003461] border-solid border-t-4 inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] pt-[28px] px-[24px] relative size-full">
        <Container22 />
        <HeatmapGrid />
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Lexend:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#191c1d] text-[20px] whitespace-nowrap">
        <p className="leading-[28px]">{`Class Roster & Progress`}</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Individual student tracking and quick actions.</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 w-[317.41px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Heading6 />
        <Container37 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip pb-[2px] pt-px relative" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[16px] w-full">
        <p className="leading-[normal]">Search student...</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#edeeef] content-stretch flex items-start justify-center overflow-clip pb-[14px] pl-[80px] pr-[12px] pt-[15px] relative rounded-[9999px] shrink-0 w-[256px]" data-name="Input">
      <Container39 />
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute bottom-1/4 content-stretch flex flex-col items-start left-[12px] top-1/4" data-name="Container">
      <div className="relative shrink-0 size-[18px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <path d={svgPaths.p8a35e00} fill="var(--fill-0, #424750)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Input />
        <Container40 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[25px] pt-[24px] px-[24px] relative size-full">
          <Container36 />
          <Container38 />
        </div>
      </div>
    </div>
  );
}

function Cell() {
  return (
    <div className="relative shrink-0 w-[327.38px]" data-name="Cell">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[24px] py-[12px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Student</p>
        </div>
      </div>
    </div>
  );
}

function Cell1() {
  return (
    <div className="relative shrink-0 w-[217.13px]" data-name="Cell">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[24px] py-[12px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Current Grade</p>
        </div>
      </div>
    </div>
  );
}

function Cell2() {
  return (
    <div className="relative shrink-0 w-[201.97px]" data-name="Cell">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[24px] py-[12px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Trend</p>
        </div>
      </div>
    </div>
  );
}

function Cell3() {
  return (
    <div className="relative shrink-0 w-[149.53px]" data-name="Cell">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end px-[24px] py-[12px] relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] text-right tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Actions</p>
        </div>
      </div>
    </div>
  );
}

function HeaderRow1() {
  return (
    <div className="bg-white content-stretch flex items-start justify-center mb-[-1px] pb-px relative shrink-0 w-full" data-name="Header → Row">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none" />
      <Cell />
      <Cell1 />
      <Cell2 />
      <Cell3 />
    </div>
  );
}

function Background14() {
  return (
    <div className="bg-[#004b87] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8abcff] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">SJ</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Sarah Jenkins</p>
      </div>
    </div>
  );
}

function Data() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-[24px] right-[592.62px] top-[12.5px]" data-name="Data">
      <Background14 />
      <Container41 />
    </div>
  );
}

function Background15() {
  return (
    <div className="bg-[#b9eeab] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3f6d38] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">92%</p>
      </div>
    </div>
  );
}

function Data1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[327.38px] px-[24px] py-[14.5px] right-[351.49px] top-0" data-name="Data">
      <Background15 />
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[9px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 9">
        <g id="Container">
          <path d={svgPaths.p1889a500} fill="var(--fill-0, #3B6934)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Data2() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-center left-[544.5px] px-[24px] py-[12.5px] right-[149.53px] top-[0.5px]" data-name="Data">
      <Container42 />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3b6934] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Steady</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[15px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
        <g id="Container">
          <path d={svgPaths.p3e801e80} fill="var(--fill-0, #003461)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
      <Container43 />
    </div>
  );
}

function Data3() {
  return (
    <div className="absolute content-stretch flex flex-col items-end left-[746.47px] px-[24px] py-[12.5px] right-0 top-0" data-name="Data">
      <Button3 />
    </div>
  );
}

function StudentRow() {
  return (
    <div className="h-[57px] relative shrink-0 w-full" data-name="Student Row 1">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none" />
      <Data />
      <Data1 />
      <Data2 />
      <Data3 />
    </div>
  );
}

function MayaLin() {
  return (
    <div className="max-w-[279.3800048828125px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Maya Lin">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[9999px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgMayaLin} />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Maya Lin</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[12.667px] relative shrink-0 w-[14.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 12.6667">
        <g id="Container">
          <path d={svgPaths.pc531a80} fill="var(--fill-0, #BA1A1A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Data4() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-[24px] right-[592.62px] top-[30px]" data-name="Data">
      <MayaLin />
      <Container44 />
      <Container45 />
    </div>
  );
}

function Background16() {
  return (
    <div className="bg-[#ffdad6] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#93000a] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">64%</p>
      </div>
    </div>
  );
}

function Data5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[327.38px] px-[24px] py-[32px] right-[351.49px] top-0" data-name="Data">
      <Background16 />
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[9px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 9">
        <g id="Container">
          <path d={svgPaths.p4d84900} fill="var(--fill-0, #BA1A1A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Data6() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-center left-[544.5px] px-[24px] py-[12.5px] right-[149.53px] top-[0.5px]" data-name="Data">
      <Container46 />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#ba1a1a] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Declining</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#003461] content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center px-[12px] py-[4px] relative rounded-[4px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">Intervene</p>
      </div>
    </div>
  );
}

function Data7() {
  return (
    <div className="absolute content-stretch flex items-start justify-end left-[544.5px] px-[24px] py-[12px] right-[149.53px] top-[43.5px]" data-name="Data">
      <Button4 />
    </div>
  );
}

function StudentRow2AtRisk() {
  return (
    <div className="bg-[rgba(255,218,214,0.2)] h-[92px] relative shrink-0 w-full" data-name="Student Row 2 (At Risk)">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-b border-solid inset-0 pointer-events-none" />
      <Data4 />
      <Data5 />
      <Data6 />
      <Data7 />
    </div>
  );
}

function Background17() {
  return (
    <div className="bg-[#793701] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#ffa46a] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">TJ</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Thomas Jefferson</p>
      </div>
    </div>
  );
}

function Data8() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-[24px] right-[592.62px] top-[12.5px]" data-name="Data">
      <Background17 />
      <Container47 />
    </div>
  );
}

function Background18() {
  return (
    <div className="bg-[#e7e8e9] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">78%</p>
      </div>
    </div>
  );
}

function Data9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[327.38px] pb-[14px] pt-[14.5px] px-[24px] right-[351.49px] top-0" data-name="Data">
      <Background18 />
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[6.75px] relative shrink-0 w-[14.25px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.25 6.75">
        <g id="Container">
          <path d={svgPaths.p20738980} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Data10() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-center left-[544.5px] px-[24px] py-[12.5px] right-[149.53px] top-[0.5px]" data-name="Data">
      <Container48 />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] whitespace-nowrap">
        <p className="leading-[normal]">Stable</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[15px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
        <g id="Container">
          <path d={svgPaths.p3e801e80} fill="var(--fill-0, #003461)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex items-center justify-center p-[4px] relative shrink-0" data-name="Button">
      <Container49 />
    </div>
  );
}

function Data11() {
  return (
    <div className="absolute content-stretch flex flex-col items-end left-[746.47px] px-[24px] py-[12px] right-0 top-0" data-name="Data">
      <Button5 />
    </div>
  );
}

function StudentRow1() {
  return (
    <div className="h-[56.5px] relative shrink-0 w-full" data-name="Student Row 3">
      <Data8 />
      <Data9 />
      <Data10 />
      <Data11 />
    </div>
  );
}

function Body() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Body">
      <StudentRow />
      <StudentRow2AtRisk />
      <StudentRow1 />
    </div>
  );
}

function Table() {
  return (
    <div className="relative shrink-0 w-full" data-name="Table">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-auto relative size-full">
        <HeaderRow1 />
        <Body />
      </div>
    </div>
  );
}

function SectionClassWideProgressOverview() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[12px] shrink-0 w-full" data-name="Section - Class-wide Progress Overview">
      <div className="content-stretch flex flex-col items-start overflow-clip pt-[4px] relative rounded-[inherit] size-full">
        <HorizontalBorder />
        <Table />
      </div>
      <div aria-hidden="true" className="absolute border-[#3b6934] border-solid border-t-4 inset-0 pointer-events-none rounded-[12px] shadow-[0px_4px_12px_0px_rgba(0,43,135,0.08)]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] max-w-[1280px] min-h-px relative w-full z-[1]" data-name="Container">
      <div className="content-stretch flex flex-col gap-[48px] items-start max-w-[inherit] px-[64px] py-[48px] relative size-full">
        <SectionAtRiskAlertsBentoGrid />
        <SectionLearningGapHeatmapBcCurriculum />
        <SectionClassWideProgressOverview />
      </div>
    </div>
  );
}

function MainContentCanvas() {
  return (
    <div className="flex-[1_0_0] min-h-[1386px] min-w-px relative self-stretch" data-name="Main Content Canvas">
      <div className="flex flex-col items-center min-h-[inherit] size-full">
        <div className="content-stretch flex flex-col isolate items-center min-h-[inherit] pb-[48px] relative size-full">
          <TopAppBarMobileContextDesktopHeader />
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#003461] text-[20px] w-full">
        <p className="leading-[28px]">Student Portal</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] w-full">
        <p className="leading-[16px]">Grade 11 • BC Curriculum</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[12px] relative size-full">
        <Heading />
        <Container51 />
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[48px] relative size-full">
        <Container50 />
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p191dcc80} fill="var(--fill-0, #003461)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#003461] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Dashboard</p>
      </div>
    </div>
  );
}

function LinkActiveTabDashboard() {
  return (
    <div className="bg-[rgba(0,75,135,0.1)] relative rounded-[8px] shrink-0 w-full" data-name="Link - Active Tab: Dashboard">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container53 />
          <Container54 />
        </div>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[18px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 18">
        <g id="Container">
          <path d={svgPaths.pb257040} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">My Learning</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container55 />
          <Container56 />
        </div>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Container">
          <path d={svgPaths.p11c2d500} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">AP Prep</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container57 />
          <Container58 />
        </div>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="h-[18px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
        <g id="Container">
          <path d={svgPaths.p3c508c40} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Mastery Reports</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container59 />
          <Container60 />
        </div>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="h-[12px] relative shrink-0 w-[24px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 12">
        <g id="Container">
          <path d={svgPaths.p5df3d80} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Community</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container61 />
          <Container62 />
        </div>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start relative size-full">
        <LinkActiveTabDashboard />
        <Link />
        <Link1 />
        <Link2 />
        <Link3 />
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[15px] relative shrink-0 w-[14.259px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.2588 15">
        <g id="Container">
          <path d={svgPaths.p27681c00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#003461] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[9999px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center justify-center px-[24px] py-[12px] relative size-full">
          <Container63 />
          <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[0.14px] whitespace-nowrap">
            <p className="leading-[20px]">Start AI Tutor</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p2816f2c0} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container65() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Help Center</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container64 />
          <Container65 />
        </div>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1 20">
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container67() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
        <p className="leading-[20px]">Settings</p>
      </div>
    </div>
  );
}

function Link5() {
  return (
    <div className="relative rounded-[8px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center p-[12px] relative size-full">
          <Container66 />
          <Container67 />
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start pt-[25px] relative size-full">
        <Button6 />
        <Link4 />
        <Link5 />
      </div>
    </div>
  );
}

function DesktopSideNavigationFromJson() {
  return (
    <div className="absolute bg-[#f8f9fa] content-stretch flex flex-col h-[1386px] items-start justify-between left-0 pl-[12px] pr-[13px] py-[24px] top-0 w-[256px]" data-name="Desktop Side Navigation (from JSON)">
      <div aria-hidden="true" className="absolute border-[#c2c6d1] border-r border-solid inset-0 pointer-events-none" />
      <div className="absolute bg-[rgba(255,255,255,0)] h-[1386px] left-0 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] top-0 w-[256px]" data-name="Desktop Side Navigation (from JSON):shadow" />
      <Margin />
      <Container52 />
      <HorizontalBorder1 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="content-stretch flex items-start justify-center pl-[256px] relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(248, 249, 250) 0%, rgb(248, 249, 250) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="教师干预仪表盘与班级分析">
      <MainContentCanvas />
      <DesktopSideNavigationFromJson />
    </div>
  );
}