import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from "../chat/ChatComponents.jsx";
import SuggestionLoading from "../ui/animations/SuggestionLoading.jsx";
import PropTypes from 'prop-types';

const ZeroChatSuggestionBox = ({ isSuggestionsLoading, suggestions, handleSuggestClick }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <Card className="w-[630px] shadow-lg">
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-row gap-4 p-1">
                            <img
                                alt="chat-icon"
                                src="/images/smartSuggestionIcon.png"
                                width={100}
                                height={100}
                                className="w-8 h-8"
                            />
                            <p className="w-full text-black">Smart Suggestions</p>
                        </div>
                    </CardTitle>
                    <CardDescription>Start Your Journey Here.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="overflow-scroll h-[200px] pb-4">
                        {isSuggestionsLoading ? (
                            <SuggestionLoading />
                        ) : (
                            suggestions?.map((notification, index) => (
                                <div
                                    key={index}
                                    className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 bg-[#F9F9F9] p-4 rounded-md"
                                >
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-[#082a3f]" />
                                    <div className="space-y-1 cursor-pointer">
                                        <p
                                            className="text-sm font-medium leading-none pointer-cursor"
                                            onClick={() => {
                                                handleSuggestClick(notification);
                                            }}
                                        >
                                            {notification}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
ZeroChatSuggestionBox.propTypes = {
    isSuggestionsLoading: PropTypes.bool.isRequired,
    suggestions: PropTypes.array.isRequired,
    handleSuggestClick: PropTypes.func.isRequired,
};

export default ZeroChatSuggestionBox;
