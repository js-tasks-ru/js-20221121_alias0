/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
	let i = 0;
	let result = '';
	if( size == undefined ) return string;
	if( !size ) return result;
	let prev = '';
	for( const letter of string.split('') ){
		if( prev === '' ){
			prev = letter;
			result += letter;
			i++;
			continue;
		}
		if( prev === letter ){
			if( i < size ){
				result += letter;
				i++;
			}
		}
		else{
			prev = letter;
			result += letter;
			i = 1;
		}
	}
	return result;
}
