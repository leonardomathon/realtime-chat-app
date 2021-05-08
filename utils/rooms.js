// Return all posible rooms
function getRooms() {
    return ['Channel 1', 'Channel 2', 'Channel 3', 'Channel 4'];
}

// Check if valid room
function checkRoom(room) {
    const index = getRooms().indexOf(room);

    if (index !== -1) {
        return true;
    }

    return false;
}

module.exports = {
    getRooms,
    checkRoom,
};
