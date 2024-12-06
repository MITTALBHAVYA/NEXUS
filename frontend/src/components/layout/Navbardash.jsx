import UserButton from "../ui/UserButton.jsx";
import PropTypes from 'prop-types';

const Navbardash = ({ title = " " }) => {
  return (
    <>
      <div className="flex items-center p-4 pl-10">
        <div className="w-1/2">
          {/* Display the title prop here */}
          <p className="text-[20px] text-[#0f9cab] w-full text-nowrap overflow-ellipsis relative top-[8px] left-10">
            {<span className="text-3xl font-bold ml-1">{title}</span>}
          </p>
        </div>
        <div className="w-full pr-4 gap-4 flex justify-between md:justify-end">
          <UserButton />
        </div>
      </div>
    </>
  );
};

Navbardash.propTypes = {
  title: PropTypes.string,
};

export default Navbardash;
