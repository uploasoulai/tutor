import svgPaths from './svg-0ka7fv6k0j';
import imgAbstractBackgroundImage from '../注册与角色选择/c2efe427cf3a093d33cca63006dfdce099f9fad0.png';

function AbstractBackgroundImage() {
  return (
    <div
      className="absolute content-stretch flex flex-col inset-0 items-start justify-center"
      data-name="Abstract Background Image"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          alt=""
          className="absolute h-full left-[-30%] max-w-none top-0 w-[160%]"
          src={imgAbstractBackgroundImage.src}
        />
      </div>
      <div
        className="backdrop-blur-[1px] bg-[rgba(0,52,97,0.2)] flex-[1_0_0] min-h-px relative w-full"
        data-name="Overlay to ensure text readability while keeping the image visible"
      />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[14.667px] relative shrink-0 w-[26.667px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 26.6667 14.6667"
      >
        <g id="Container">
          <path d={svgPaths.p6563900} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0"
      data-name="Heading 1"
    >
      <div className="flex flex-col font-['Lexend:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[32px] text-white tracking-[-0.8px] whitespace-nowrap">
        <p className="leading-[40px]">Coastal AI</p>
      </div>
    </div>
  );
}

function BrandLogoArea() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full"
      data-name="Brand Logo Area"
    >
      <Container />
      <Heading />
    </div>
  );
}

function Heading1() {
  return (
    <div
      className="content-stretch drop-shadow-[0px_2px_1px_rgba(0,0,0,0.06),0px_4px_1.5px_rgba(0,0,0,0.07)] flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Lexend:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[48px] text-white tracking-[-0.96px] whitespace-nowrap">
        <p className="leading-[56px] mb-0">Empowering BC</p>
        <p className="leading-[56px]">Students</p>
      </div>
    </div>
  );
}

function BorderOverlayBlur() {
  return (
    <div
      className="backdrop-blur-[2px] relative rounded-[12px] shrink-0 w-full"
      data-name="Border+OverlayBlur"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="content-stretch flex flex-col items-start p-[25px] relative size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-[rgba(255,255,255,0.9)] whitespace-nowrap">
          <p className="leading-[28px] mb-0">Join an intelligent learning platform meticulously</p>
          <p className="leading-[28px] mb-0">aligned with the British Columbia Ministry of</p>
          <p className="leading-[28px] mb-0">Education standards. Discover personalized</p>
          <p className="leading-[28px] mb-0">pathways that adapt to your unique academic</p>
          <p className="leading-[28px]">journey.</p>
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[18px] relative shrink-0 w-[22px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 22 18"
      >
        <g id="Container">
          <path d={svgPaths.pb257040} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorderOverlayBlur() {
  return (
    <div
      className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.2)] content-stretch flex items-center justify-center p-px relative rounded-[9999px] shrink-0 size-[48px]"
      data-name="Overlay+Border+OverlayBlur"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[9999px]"
      />
      <Container1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[21px] relative shrink-0 w-[22px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 22 21"
      >
        <g id="Container">
          <path d={svgPaths.p13774060} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorderOverlayBlur1() {
  return (
    <div
      className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.2)] content-stretch flex items-center justify-center p-px relative rounded-[9999px] shrink-0 size-[48px]"
      data-name="Overlay+Border+OverlayBlur"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[9999px]"
      />
      <Container2 />
    </div>
  );
}

function TrustBadges() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full"
      data-name="Trust Badges"
    >
      <OverlayBorderOverlayBlur />
      <OverlayBorderOverlayBlur1 />
    </div>
  );
}

function ValuePropositionStandardsMessaging() {
  return (
    <div
      className="content-stretch flex flex-col gap-[24px] items-start max-w-[448px] relative shrink-0 w-full"
      data-name="Value Proposition / Standards Messaging"
    >
      <Heading1 />
      <BorderOverlayBlur />
      <TrustBadges />
    </div>
  );
}

function ValuePropositionStandardsMessagingMargin() {
  return (
    <div
      className="content-stretch flex flex-col items-start max-w-[448px] pb-[80px] relative shrink-0 w-[448px]"
      data-name="Value Proposition / Standards Messaging:margin"
    >
      <ValuePropositionStandardsMessaging />
    </div>
  );
}

function ContentOverlay() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Content Overlay">
      <div className="content-stretch flex flex-col items-start justify-between p-[64px] relative size-full">
        <BrandLogoArea />
        <ValuePropositionStandardsMessagingMargin />
      </div>
    </div>
  );
}

export function LeftPanelBrandAcademicImageryHiddenOnMobile() {
  return (
    <div
      className="bg-[#e7e8e9] content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-w-px overflow-clip relative self-stretch"
      data-name="Left Panel: Brand & Academic Imagery (Hidden on mobile)"
    >
      <AbstractBackgroundImage />
      <ContentOverlay />
    </div>
  );
}

function Heading2() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Lexend:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#191c1d] text-[32px] w-full">
        <p className="leading-[40px]">Create your account</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[16px] w-full">
        <p className="leading-[24px]">Select your role to get started.</p>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full"
      data-name="Header"
    >
      <Heading2 />
      <Container4 />
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 size-[23.333px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 23.3333 23.3333"
      >
        <g id="Container">
          <path d={svgPaths.p38be600} fill="var(--fill-0, #003461)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div
      className="bg-[rgba(0,52,97,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]"
      data-name="Overlay"
    >
      <Container5 />
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[60px] relative shrink-0 w-[48px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12px] relative size-full">
        <Overlay />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Student</p>
        </div>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="image">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
      >
        <g id="image">
          <path d={svgPaths.p3851da00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Input() {
  return (
    <div
      className="absolute bg-[#2563eb] left-[65.66px] opacity-0 rounded-[16px] size-[18px] top-[57px]"
      data-name="Input"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <Image />
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[16px]"
      />
    </div>
  );
}

function SelectionIndicator() {
  return (
    <div
      className="absolute right-[14px] size-[16.667px] top-[14px]"
      data-name="Selection indicator"
    >
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16.6667 16.6667"
      >
        <g id="Selection indicator">
          <path d={svgPaths.p20c60900} fill="var(--fill-0, #003461)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function LabelStudentRoleCardSelectedStateExample() {
  return (
    <div
      className="bg-[rgba(211,228,255,0.3)] col-1 justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0"
      data-name="Label - Student Role Card (Selected State Example)"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-[#003461] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_4px_12px_0px_rgba(0,43,135,0.08)]"
      />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[26px] relative size-full">
          <Margin />
          <Container6 />
          <Input />
          <SelectionIndicator />
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[18.667px] relative shrink-0 w-[22.75px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 22.75 18.6667"
      >
        <g id="Container">
          <path d={svgPaths.p38458780} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div
      className="bg-[#e1e3e4] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]"
      data-name="Background"
    >
      <Container7 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[60px] relative shrink-0 w-[48px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12px] relative size-full">
        <Background />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Teacher</p>
        </div>
      </div>
    </div>
  );
}

function LabelTeacherRoleCard() {
  return (
    <div
      className="bg-[#f8f9fa] col-2 justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0"
      data-name="Label - Teacher Role Card"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[25px] py-[26px] relative size-full">
          <Margin1 />
          <Container8 />
          <div
            className="absolute bg-white left-[66.65px] opacity-0 rounded-[16px] size-[16px] top-[58px]"
            data-name="Input"
          >
            <div
              aria-hidden="true"
              className="absolute border border-[#6b7280] border-solid inset-0 pointer-events-none rounded-[16px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[23.333px] relative shrink-0 w-[23.917px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 23.9167 23.3333"
      >
        <g id="Container">
          <path d={svgPaths.p27717380} fill="var(--fill-0, #424750)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div
      className="bg-[#e1e3e4] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]"
      data-name="Background"
    >
      <Container9 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="h-[60px] relative shrink-0 w-[48px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12px] relative size-full">
        <Background1 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[14px] tracking-[0.14px] whitespace-nowrap">
          <p className="leading-[20px]">Parent</p>
        </div>
      </div>
    </div>
  );
}

function LabelParentRoleCard() {
  return (
    <div
      className="bg-[#f8f9fa] col-3 justify-self-stretch relative rounded-[12px] row-1 self-start shrink-0"
      data-name="Label - Parent Role Card"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[25px] py-[26px] relative size-full">
          <Margin2 />
          <Container10 />
          <div
            className="absolute bg-white left-[66.65px] opacity-0 rounded-[16px] size-[16px] top-[58px]"
            data-name="Input"
          >
            <div
              aria-hidden="true"
              className="absolute border border-[#6b7280] border-solid inset-0 pointer-events-none rounded-[16px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldsetRoleSelectionBentoGridStyle() {
  return (
    <div
      className="gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[_132px] pt-[12px] relative shrink-0 w-full"
      data-name="Fieldset - Role Selection (Bento Grid Style)"
    >
      <LabelStudentRoleCardSelectedStateExample />
      <LabelTeacherRoleCard />
      <LabelParentRoleCard />
    </div>
  );
}

function Label() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
        <p className="leading-[20px]">First Name</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[2px] pt-px relative rounded-[inherit] size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#727781] text-[16px] w-full">
          <p className="leading-[normal]">Jane</p>
        </div>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pb-[15px] pt-[16px] px-[17px] relative size-full">
          <Container12 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
    </div>
  );
}

function FirstName() {
  return (
    <div
      className="col-1 content-stretch flex flex-col gap-[4px] items-start justify-self-stretch relative row-1 self-start shrink-0"
      data-name="First Name"
    >
      <Label />
      <Input1 />
    </div>
  );
}

function Label1() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
        <p className="leading-[20px]">Last Name</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[2px] pt-px relative rounded-[inherit] size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#727781] text-[16px] w-full">
          <p className="leading-[normal]">Doe</p>
        </div>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pb-[15px] pt-[16px] px-[17px] relative size-full">
          <Container13 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
    </div>
  );
}

function LastName() {
  return (
    <div
      className="col-2 content-stretch flex flex-col gap-[4px] items-start justify-self-stretch relative row-1 self-start shrink-0"
      data-name="Last Name"
    >
      <Label1 />
      <Input2 />
    </div>
  );
}

function Container11() {
  return (
    <div
      className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[_74px] relative shrink-0 w-full"
      data-name="Container"
    >
      <FirstName />
      <LastName />
    </div>
  );
}

function Label2() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
        <p className="leading-[20px]">Email Address</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[2px] pt-px relative rounded-[inherit] size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#727781] text-[16px] w-full">
          <p className="leading-[normal]">student@example.com</p>
        </div>
      </div>
    </div>
  );
}

function Input3() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pb-[15px] pl-[49px] pr-[17px] pt-[16px] relative size-full">
          <Container15 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[13.333px] relative shrink-0 w-[16.667px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16.6667 13.3333"
      >
        <g id="Container">
          <path d={svgPaths.p68cd680} fill="var(--fill-0, #727781)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container16() {
  return (
    <div
      className="absolute bottom-0 content-stretch flex items-center left-0 pl-[16px] top-0"
      data-name="Container"
    >
      <Container17 />
    </div>
  );
}

function Container14() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Input3 />
      <Container16 />
    </div>
  );
}

function Email() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full"
      data-name="Email"
    >
      <Label2 />
      <Container14 />
    </div>
  );
}

function Label3() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1d] text-[14px] tracking-[0.14px] w-full">
        <p className="leading-[20px]">Password</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[2px] pt-px relative rounded-[inherit] size-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#727781] text-[16px] w-full">
          <p className="leading-[normal]">••••••••</p>
        </div>
      </div>
    </div>
  );
}

function Input4() {
  return (
    <div className="bg-[#f8f9fa] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pb-[15px] pl-[49px] pr-[17px] pt-[16px] relative size-full">
          <Container19 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#c2c6d1] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[17.5px] relative shrink-0 w-[13.333px]" data-name="Container">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 13.3333 17.5"
      >
        <g id="Container">
          <path d={svgPaths.p2eed4060} fill="var(--fill-0, #727781)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div
      className="absolute bottom-0 content-stretch flex items-center left-0 pl-[16px] top-0"
      data-name="Container"
    >
      <Container21 />
    </div>
  );
}

function Container18() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Input4 />
      <Container20 />
    </div>
  );
}

function Container22() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#424750] text-[12px] w-full">
        <p className="leading-[16px]">Must be at least 8 characters long.</p>
      </div>
    </div>
  );
}

function Password() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-start pb-[12px] relative shrink-0 w-full"
      data-name="Password"
    >
      <Label3 />
      <Container18 />
      <Container22 />
    </div>
  );
}

function Container23() {
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

function SubmitButtonButton() {
  return (
    <div
      className="bg-[#003461] drop-shadow-[0px_4px_6px_rgba(0,43,135,0.08)] relative rounded-[9999px] shrink-0 w-full"
      data-name="Submit Button → Button"
    >
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[16px] relative size-full">
          <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[0.14px] whitespace-nowrap">
            <p className="leading-[20px]">Create Account</p>
          </div>
          <Container23 />
        </div>
      </div>
    </div>
  );
}

function FormFields() {
  return (
    <div
      className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full"
      data-name="Form Fields"
    >
      <Container11 />
      <Email />
      <Password />
      <SubmitButtonButton />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="relative shrink-0 w-full" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center leading-[0] not-italic relative size-full text-center whitespace-nowrap">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center mr-[-0.01px] relative shrink-0 text-[#424750] text-[16px]">
          <p className="leading-[24px]">{`Already have an account? `}</p>
        </div>
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#003461] text-[14px] tracking-[0.14px]">
          <p className="leading-[20px]">Sign in here</p>
        </div>
      </div>
    </div>
  );
}

function LoginLink() {
  return (
    <div
      className="content-stretch flex flex-col items-start pt-[25px] relative shrink-0 w-full"
      data-name="Login Link"
    >
      <div
        aria-hidden="true"
        className="absolute border-[rgba(194,198,209,0.5)] border-solid border-t inset-0 pointer-events-none"
      />
      <Paragraph />
    </div>
  );
}

function Container3() {
  return (
    <div
      className="content-stretch flex flex-col gap-[80px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Header />
      <FieldsetRoleSelectionBentoGridStyle />
      <FormFields />
      <LoginLink />
    </div>
  );
}

function MainFormContainer() {
  return (
    <div
      className="flex-[1_0_0] max-w-[600px] min-h-px relative w-full"
      data-name="Main Form Container"
    >
      <div className="flex flex-col items-center justify-center max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center justify-center max-w-[inherit] p-[64px] relative size-full">
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function RightPanelRegistrationForm() {
  return (
    <div
      className="bg-white flex-[1_0_0] h-[1024px] min-w-px relative"
      data-name="Right Panel: Registration Form"
    >
      <div className="flex flex-col justify-center overflow-auto size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[20px] relative size-full">
          <MainFormContainer />
        </div>
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div
      className="content-stretch flex items-start relative size-full"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(248, 249, 250) 0%, rgb(248, 249, 250) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
      }}
      data-name="注册与角色选择"
    >
      <LeftPanelBrandAcademicImageryHiddenOnMobile />
      <RightPanelRegistrationForm />
    </div>
  );
}
