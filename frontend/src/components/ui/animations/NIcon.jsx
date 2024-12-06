// components/NIcon.tsx
const NIcon = () => (
    <div className="relative w-fit h-fit">
      <svg
        width={40}
        height={40}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute z-[4]"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle cx={20} cy={20} r={20} fill="#082a3f" />
      </svg>
      <p className="absolute z-[6] left-[12px] top-[4px] text-[22px] text-left text-white">
        N
      </p>
    </div>
  );
  
  export default NIcon;
  