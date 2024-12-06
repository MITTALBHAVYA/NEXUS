import PropTypes from 'prop-types';

const PageLayout = ({ children }) => {
    return (
        <div
            className="bg-cover bg-center min-h-screen flex flex-col"
            style={{
                backgroundImage: 'url(/images/newbg6.jpg)',
                backgroundColor: 'grey', // Set background color
                backgroundBlendMode: 'overlay', // Blend the color and image
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
