const normalizeData = ({data}) => {
    const total = data.reduce((sum,item)=>{
      return(
        sum + Object.values(item).reduce((a,b)=>{
          return a + (typeof b === "number" && !isNaN(b)?b:0);
        },0)
      );
    },0);
    return data.map((item)=>{
      const normalizedItem = {...item};
      Object.keys(item).forEach((key)=>{
        if(key !== "label" && typeof item[key] === "number" && !isNaN(item[key])){
          normalizedItem[key] = parseFloat(
            ((item[key]/total)*100).toFixed(1)
          );
        }
      });
      return normalizedItem;
    });
  };
  export default normalizeData;