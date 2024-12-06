import NIcon from "./NIcon";
import LoadingAnimation from "./LoadingAnimation";
const LoadingPart = () => {
    return (
        <div className="w-full flex flex-row">
            <NIcon />
            <div className="flex flex-col space-y-3 w-[400px]">
                <LoadingAnimation />
            </div>
        </div>
    )
}

export default LoadingPart
