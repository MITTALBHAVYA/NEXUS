import PropTypes from 'prop-types';

const Card = ({ children }) => {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            {children}
        </div>
    )
}

Card.propTypes = {
    children: PropTypes.node.isRequired,
}

const CardHeader = ({ children }) => {
    return (
        <div className="flex flex-col space-y-1.5 p-6">
            {children}
        </div>
    )
}

CardHeader.propTypes = {
    children: PropTypes.node.isRequired,
}

const CardTitle = ({ children }) => {
    return (
        <div className="text-2xl font-semibold leading-none tracking-tight">
            {children}
        </div>
    )
}

CardTitle.propTypes = {
    children: PropTypes.node.isRequired,
}

const CardDescription = ({ children }) => {
    return (
        <div className="text-sm text-muted-foreground">
            {children}
        </div>
    )
}

CardDescription.propTypes = {
    children: PropTypes.node.isRequired,
}

const CardContent = ({ children }) => {
    return (
        <div className="p-6 pt-0">
            {children}
        </div>
    )
}

CardContent.propTypes = {
    children: PropTypes.node.isRequired,
}

const CardFooter = ({ children }) => {
    return (
        <div className="flex items-center p-6 pt-0">
            {children}
        </div>
    )
}
CardFooter.propTypes = {
    children: PropTypes.node.isRequired,
}
const UserCard = ({ content }) => {
    return (
        <div className="flex flex-wrap justify-end items-center relative gap-2 p-4 rounded-2xl bg-[#082a3f] text-white shadow-xl">
            <p className="flex-grow-0 w-full flex-shrink-0 text-md text-left text-wrap">
                {content}
            </p>
        </div>
    )
}

UserCard.propTypes = {
    content: PropTypes.string.isRequired,
}

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
    UserCard
};
