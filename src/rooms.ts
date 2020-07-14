type Room<Member> = Set<Member>;

export class Rooms<Member> {
    private _rooms: {[key: string]: Room<Member>} = {};

    addMember(roomName: string, member: Member) {
        if (!this._rooms[roomName]) {
            this._rooms[roomName] = new Set();
        }

        this._rooms[roomName].add(member);
    }

    removeMember(member: Member) {
        Object.keys(this._rooms).forEach((roomName) => {
            const room = this._rooms[roomName];

            room.forEach((mem: Member) => {
                if (mem === member) {
                    this._rooms[roomName].delete(mem);
                    if (room.size === 0) {
                        delete this._rooms[roomName];
                    }
                }
            })
        });
    }

    removeMemberFromRoom(roomName: string, member: Member) {
        if (!this._rooms[roomName]) {
            return;
        }

        this._rooms[roomName].delete(member);

        if (this._rooms[roomName].size === 0) {
            delete this._rooms[roomName];
        }
    }

    forRoom(roomName, cb: (member: Member) => void) {
        if (!this._rooms[roomName]) {
            return;
        }

        this._rooms[roomName].forEach((member) => {
            cb(member);
        });
    }

    countRooms(): number {
        return Object.keys(this._rooms).length;
    }
}