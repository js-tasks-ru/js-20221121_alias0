/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {	
	const result = {};
	
	for ( let key in obj ){				
		let key_in_fields = false;
		
		for ( let field of fields ){
			if(key == field){
				key_in_fields = true;
				break;
			}
		}
		
		if(!key_in_fields){
			result[key] = obj[key];
		}		
	}
	
	return result;
};
