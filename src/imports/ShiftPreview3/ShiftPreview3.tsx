import svgPaths from "./svg-tyjr69l94i";

function P() {
  return (
    <div className="relative shrink-0 w-full" data-name="p">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[99px] relative w-full">
          <p className="font-['Sentient:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#57534d] text-[32px] text-center whitespace-nowrap">What the shift was</p>
        </div>
      </div>
    </div>
  );
}

function P1() {
  return (
    <div className="relative shrink-0 w-full" data-name="p">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[13px] relative w-full">
          <p className="font-['GT_Pressura_LCGV:Extended_Regular',sans-serif] leading-[26px] not-italic relative shrink-0 text-[#292524] text-[16px] text-center w-[304px]">The conversation tone became more tense. Multiple people are speaking louder and faster than before.</p>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <P />
      <P1 />
    </div>
  );
}

function ActionButton() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Action Button">
      <p className="decoration-[7.5%] decoration-solid font-['GT_Pressura_LCGV:Extended_Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#3b6cac] text-[14px] text-center underline whitespace-nowrap">Explore mindful practices</p>
    </div>
  );
}

function Buttons() {
  return (
    <div className="content-stretch flex flex-col gap-[18px] items-center justify-center relative shrink-0" data-name="Buttons">
      <div className="bg-[#3e86bd] content-stretch flex items-center justify-center px-[12px] py-[8px] relative rounded-[24px] shrink-0" data-name="Button">
        <p className="font-['GT_Pressura_LCGV:Extended_Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">{`What does this mean? `}</p>
      </div>
      <ActionButton />
    </div>
  );
}

function Content() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[48px] items-center left-1/2 top-1/2 w-[330px]" data-name="Content">
      <Container />
      <Buttons />
    </div>
  );
}

export default function ShiftPreview() {
  return (
    <div className="bg-[#eeedde] relative size-full" data-name="Shift Preview 3">
      <div className="absolute h-[585.443px] left-[-273px] top-[calc(66.67%+48px)] w-[635.377px]">
        <div className="absolute inset-[-0.67%_-0.61%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 643.177 593.243">
            <g filter="url(#filter0_ngf_311_183)" id="Vector 4" opacity="0.65">
              <path clipRule="evenodd" d={svgPaths.p9adf800} fill="url(#paint0_radial_311_183)" fillRule="evenodd" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="593.243" id="filter0_ngf_311_183" width="643.177" x="6.66205e-08" y="-8.44569e-08">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feTurbulence baseFrequency="1.4285714626312256 1.4285714626312256" numOctaves="3" result="noise" seed="2598" stitchTiles="stitch" type="fractalNoise" />
                <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                  <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                </feComponentTransfer>
                <feComposite in="coloredNoise1" in2="shape" operator="in" result="noise1Clipped" />
                <feComponentTransfer in="alphaNoise" result="coloredNoise2">
                  <feFuncA tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 " type="discrete" />
                </feComponentTransfer>
                <feComposite in="coloredNoise2" in2="shape" operator="in" result="noise2Clipped" />
                <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
                <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                <feFlood floodColor="rgba(255, 255, 255, 0.25)" result="color2Flood" />
                <feComposite in="color2Flood" in2="noise2Clipped" operator="in" result="color2" />
                <feMerge result="effect1_noise_311_183">
                  <feMergeNode in="shape" />
                  <feMergeNode in="color1" />
                  <feMergeNode in="color2" />
                </feMerge>
                <feTurbulence baseFrequency="0.081300809979438782 0.081300809979438782" numOctaves="3" seed="8044" type="fractalNoise" />
                <feDisplacementMap height="100%" in="effect1_noise_311_183" result="displacedImage" scale="7.8000001907348633" width="100%" xChannelSelector="R" yChannelSelector="G" />
                <feMerge result="effect2_texture_311_183">
                  <feMergeNode in="displacedImage" />
                </feMerge>
                <feGaussianBlur result="effect3_foregroundBlur_311_183" stdDeviation="0.6" />
              </filter>
              <radialGradient cx="0" cy="0" gradientTransform="translate(321.588 296.621) rotate(90) scale(292.721 317.688)" gradientUnits="userSpaceOnUse" id="paint0_radial_311_183" r="1">
                <stop stopColor="#3431DE" />
                <stop offset="0.548077" stopColor="#34A0DE" />
                <stop offset="1" stopColor="#34A0DE" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute flex h-[740.714px] items-center justify-center left-[-96px] top-[-505px] w-[731.237px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-rotate-163 flex-none">
          <div className="h-[596.541px] relative w-[582.268px]">
            <div className="absolute inset-[-0.65%_-0.67%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 590.068 604.341">
                <g filter="url(#filter0_ngf_311_187)" id="Vector 3">
                  <path clipRule="evenodd" d={svgPaths.p2b78af00} fill="url(#paint0_radial_311_187)" fillRule="evenodd" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="604.341" id="filter0_ngf_311_187" width="590.068" x="-1.33632e-08" y="-7.24461e-08">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feTurbulence baseFrequency="1.4285714626312256 1.4285714626312256" numOctaves="3" result="noise" seed="2598" stitchTiles="stitch" type="fractalNoise" />
                    <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise1" in2="shape" operator="in" result="noise1Clipped" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise2">
                      <feFuncA tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise2" in2="shape" operator="in" result="noise2Clipped" />
                    <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
                    <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                    <feFlood floodColor="rgba(255, 255, 255, 0.25)" result="color2Flood" />
                    <feComposite in="color2Flood" in2="noise2Clipped" operator="in" result="color2" />
                    <feMerge result="effect1_noise_311_187">
                      <feMergeNode in="shape" />
                      <feMergeNode in="color1" />
                      <feMergeNode in="color2" />
                    </feMerge>
                    <feTurbulence baseFrequency="0.081300809979438782 0.081300809979438782" numOctaves="3" seed="8044" type="fractalNoise" />
                    <feDisplacementMap height="100%" in="effect1_noise_311_187" result="displacedImage" scale="7.8000001907348633" width="100%" xChannelSelector="R" yChannelSelector="G" />
                    <feMerge result="effect2_texture_311_187">
                      <feMergeNode in="displacedImage" />
                    </feMerge>
                    <feGaussianBlur result="effect3_foregroundBlur_311_187" stdDeviation="0.6" />
                  </filter>
                  <radialGradient cx="0" cy="0" gradientTransform="translate(295.034 302.17) rotate(90) scale(298.27 291.134)" gradientUnits="userSpaceOnUse" id="paint0_radial_311_187" r="1">
                    <stop stopColor="#3431DE" />
                    <stop offset="0.605769" stopColor="#34A0DE" />
                    <stop offset="1" stopColor="#34A0DE" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[-407px] size-[725.174px] top-[-402.49px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-rotate-135 flex-none">
          <div className="h-[518.984px] relative w-[506.567px]">
            <div className="absolute inset-[-0.75%_-0.77%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 514.367 526.784">
                <g filter="url(#filter0_ngf_311_185)" id="Vector 2">
                  <path clipRule="evenodd" d={svgPaths.p2148c300} fill="url(#paint0_radial_311_185)" fillRule="evenodd" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="526.784" id="filter0_ngf_311_185" width="514.367" x="-1.08054e-07" y="-1.48319e-08">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feTurbulence baseFrequency="1.4285714626312256 1.4285714626312256" numOctaves="3" result="noise" seed="2598" stitchTiles="stitch" type="fractalNoise" />
                    <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise1" in2="shape" operator="in" result="noise1Clipped" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise2">
                      <feFuncA tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise2" in2="shape" operator="in" result="noise2Clipped" />
                    <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
                    <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                    <feFlood floodColor="rgba(255, 255, 255, 0.25)" result="color2Flood" />
                    <feComposite in="color2Flood" in2="noise2Clipped" operator="in" result="color2" />
                    <feMerge result="effect1_noise_311_185">
                      <feMergeNode in="shape" />
                      <feMergeNode in="color1" />
                      <feMergeNode in="color2" />
                    </feMerge>
                    <feTurbulence baseFrequency="0.081300809979438782 0.081300809979438782" numOctaves="3" seed="8044" type="fractalNoise" />
                    <feDisplacementMap height="100%" in="effect1_noise_311_185" result="displacedImage" scale="7.8000001907348633" width="100%" xChannelSelector="R" yChannelSelector="G" />
                    <feMerge result="effect2_texture_311_185">
                      <feMergeNode in="displacedImage" />
                    </feMerge>
                    <feGaussianBlur result="effect3_foregroundBlur_311_185" stdDeviation="0.6" />
                  </filter>
                  <radialGradient cx="0" cy="0" gradientTransform="translate(257.184 263.392) rotate(90) scale(259.492 253.284)" gradientUnits="userSpaceOnUse" id="paint0_radial_311_185" r="1">
                    <stop stopColor="#3431DE" />
                    <stop offset="0.605769" stopColor="#34A0DE" />
                    <stop offset="1" stopColor="#34A0DE" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[707.607px] items-center justify-center left-[-62px] top-[calc(58.33%+12px)] w-[686.847px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-rotate-65 flex-none">
          <div className="h-[503.195px] relative w-[546.114px]">
            <div className="absolute inset-[-0.78%_-0.71%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 553.914 510.995">
                <g filter="url(#filter0_ngf_311_181)" id="Vector 1" opacity="0.65">
                  <path clipRule="evenodd" d={svgPaths.p2da666c0} fill="url(#paint0_radial_311_181)" fillRule="evenodd" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="510.995" id="filter0_ngf_311_181" width="553.914" x="1.05121e-07" y="4.28774e-08">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feTurbulence baseFrequency="1.4285714626312256 1.4285714626312256" numOctaves="3" result="noise" seed="2598" stitchTiles="stitch" type="fractalNoise" />
                    <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                      <feFuncA tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise1" in2="shape" operator="in" result="noise1Clipped" />
                    <feComponentTransfer in="alphaNoise" result="coloredNoise2">
                      <feFuncA tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 " type="discrete" />
                    </feComponentTransfer>
                    <feComposite in="coloredNoise2" in2="shape" operator="in" result="noise2Clipped" />
                    <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
                    <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
                    <feFlood floodColor="rgba(255, 255, 255, 0.25)" result="color2Flood" />
                    <feComposite in="color2Flood" in2="noise2Clipped" operator="in" result="color2" />
                    <feMerge result="effect1_noise_311_181">
                      <feMergeNode in="shape" />
                      <feMergeNode in="color1" />
                      <feMergeNode in="color2" />
                    </feMerge>
                    <feTurbulence baseFrequency="0.081300809979438782 0.081300809979438782" numOctaves="3" seed="8044" type="fractalNoise" />
                    <feDisplacementMap height="100%" in="effect1_noise_311_181" result="displacedImage" scale="7.8000001907348633" width="100%" xChannelSelector="R" yChannelSelector="G" />
                    <feMerge result="effect2_texture_311_181">
                      <feMergeNode in="displacedImage" />
                    </feMerge>
                    <feGaussianBlur result="effect3_foregroundBlur_311_181" stdDeviation="0.6" />
                  </filter>
                  <radialGradient cx="0" cy="0" gradientTransform="translate(276.957 255.498) rotate(90) scale(251.598 273.057)" gradientUnits="userSpaceOnUse" id="paint0_radial_311_181" r="1">
                    <stop stopColor="#3431DE" />
                    <stop offset="0.548077" stopColor="#34A0DE" />
                    <stop offset="1" stopColor="#34A0DE" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Content />
    </div>
  );
}