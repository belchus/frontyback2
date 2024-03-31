import pkg from 'uuid';
const { v4: uuidv4 } = pkg;

function generateSessionId() {
    return uuidv4(); // Esto generará un UUID versión 4
}

export default generateSessionId;
