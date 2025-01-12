const BuildChartData = (data, maxAdditionalLabels = 2) => {
    return data.map((item) => {
        const keys = Object.keys(item).filter((key) => key !== "label");
        const transformedData = {
            label: item.label,
            data: item,
            additionalLabels: {},
        };

        keys.forEach((key, index) => {
            if (index < maxAdditionalLabels) {
                transformedData.additionalLabels[`label${index + 1}`] = {
                    name: key,
                    value: item[key],
                };
            }
        });

        return transformedData;
    });
};

export default BuildChartData;