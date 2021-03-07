export const lowercase = (jsonData) => {
    // takes a JSON value
    // returns the JSON with all string values Lowercased
    
    return JSON.parse(JSON.stringify(jsonData, replacer)) // used to e JSON.parse(JSON.stringify(jsonData, replacer))
  }
  
  function replacer(key, value) {
    if (typeof value === 'string') {
      return value.toString().toLowerCase();
    }
    return value;
  }