class Git {
    private _name: string;
    private _lastCommitId = -1;
    private _head: Branch = new Branch('main', null);
    private _branchMap: Map<string, Branch> = new Map([['main', this._head]]);
    constructor(name: string) {
        this._name = name;
    }
    get head() {
        return this._head;
    }
    commit(message: string) {
        const commitId = ++this._lastCommitId;
        const newCommit = new Commit(commitId.toString(), this._head.lastCommit, message);

        this._head.pushCommit(newCommit);

        return newCommit;
    }
    checkout(name: string, originBranchName: string = this._head.name) {
        const originBranch = this._branchMap.get(originBranchName);

        if (!originBranch) {
            console.error('can not find this branch');

            return this._head;
        }

        const targetBranch = this._branchMap.get(name);

        if (!targetBranch) {
            const newBranch = new Branch(name, originBranch.lastCommit);

            this._branchMap.set(name, newBranch);
            this._head = newBranch;
        } else {
            this._head = targetBranch;
        }

        console.log('checkout', name);

        return this._head;
    }
    log() {
        const history: Commit[] = [];
        let current = this._head.lastCommit;

        while (current) {
            history.push(current);
            current = current.parent;
        }

        console.log(history);
    }
}

class Branch {
    private _name: string;
    private _lastCommit: Commit | null;
    constructor(name: string, commit: Commit | null) {
        this._name = name;
        this._lastCommit = commit;
    }

    get lastCommit() {
        return this._lastCommit;
    }
    get name() {
        return this._name;
    }

    pushCommit(commit: Commit) {
        this._lastCommit = commit;
    }
}

class Commit {
    private _id: string;
    private _message: string;
    private _parent: Commit | null = null;
    constructor(id: string, parent: Commit | null, message: string) {
        this._id = id;
        this._message = message;
        this._parent = parent;
    }

    get id() {
        return this._id;
    }

    get message() {
        return this._message;
    }

    get parent() {
        return this._parent;
    }
}

export { Git, Branch, Commit };
