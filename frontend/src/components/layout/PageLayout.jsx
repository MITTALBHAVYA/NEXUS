import PropTypes from 'prop-types';

const PageLayout = ({ children }) => {
    return (
        <div
            className="bg-cover bg-center min-h-screen flex flex-col"
            style={{
                backgroundColor: 'white', // Changed from grey to white
                backgroundBlendMode: 'overlay',
            }}
        >
            {children}
        </div>
    );
};

PageLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PageLayout;
