export function HomeAiAtmosphere() {
  return (
    <div className="home-ai-atmosphere" aria-hidden="true">
      <svg
        className="home-neural-field"
        viewBox="0 0 1200 680"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="neural-cluster neural-left">
          <path d="M70 170 180 105 285 165 365 115" />
          <path d="M95 330 180 260 285 315 380 250" />
          <path d="M180 105 180 260" />
          <path d="M285 165 285 315" />
          <path d="M70 170 95 330" />
          <circle cx="70" cy="170" r="4" />
          <circle cx="180" cy="105" r="5" />
          <circle cx="285" cy="165" r="4" />
          <circle cx="365" cy="115" r="3.5" />
          <circle cx="95" cy="330" r="4" />
          <circle cx="180" cy="260" r="4.5" />
          <circle cx="285" cy="315" r="5" />
          <circle cx="380" cy="250" r="3.5" />
        </g>

        <g className="neural-cluster neural-right">
          <path d="M830 120 930 180 1035 115 1135 190" />
          <path d="M815 285 925 340 1030 275 1145 345" />
          <path d="M930 180 925 340" />
          <path d="M1035 115 1030 275" />
          <path d="M1135 190 1145 345" />
          <circle cx="830" cy="120" r="4" />
          <circle cx="930" cy="180" r="5" />
          <circle cx="1035" cy="115" r="4" />
          <circle cx="1135" cy="190" r="4.5" />
          <circle cx="815" cy="285" r="3.5" />
          <circle cx="925" cy="340" r="4.5" />
          <circle cx="1030" cy="275" r="5" />
          <circle cx="1145" cy="345" r="4" />
        </g>

        <g className="neural-cluster neural-lower">
          <path d="M255 520 370 575 490 530" />
          <path d="M710 535 825 585 950 525" />
          <circle cx="255" cy="520" r="3.5" />
          <circle cx="370" cy="575" r="4" />
          <circle cx="490" cy="530" r="3.5" />
          <circle cx="710" cy="535" r="3.5" />
          <circle cx="825" cy="585" r="4" />
          <circle cx="950" cy="525" r="3.5" />
        </g>
      </svg>

      <div className="ai-speech-bubble ai-speech-one">
        <span lang="bal" dir="rtl">سلام</span>
      </div>

      <div className="ai-speech-bubble ai-speech-two">
        <span lang="bal" dir="rtl">بلوچی</span>
      </div>

      <div className="ai-speech-bubble ai-speech-three">
        <span>···</span>
      </div>
    </div>
  );
}
