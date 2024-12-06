// components/LoadingAnimation.tsx
const LoadingAnimation = () => (
    <div className="flex items-center justify-start p-4 bg-gray-100 rounded-lg mb-4 ml-20 w-[70%]">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-[#29aebb] rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-[#29aebb] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        <div className="w-3 h-3 bg-[#29aebb] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  );
  
  export default LoadingAnimation;
  