
const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-24 h-24">
        {/* Outer rotating circle */}
        <div className="absolute w-full h-full rounded-full border-4 border-t-[#00deb6] border-r-[#00deb6] border-b-transparent border-l-transparent animate-spin"></div>
        
        {/* Inner rotating circle */}
        <div className="absolute w-16 h-16 top-4 left-4 rounded-full border-4 border-r-[#00deb6] border-t-transparent border-b-transparent border-l-transparent animate-spin-slow"></div>
        
        {/* Center dot */}
        <div className="absolute w-2 h-2 bg-[#00deb6] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      {/* Loading text */}
      <p className="mt-4 text-lg font-medium text-gray-600">Loading</p>
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-2 bg-[#00deb6] rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-[#00deb6] rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-[#00deb6] rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  );
};

export default Loading;