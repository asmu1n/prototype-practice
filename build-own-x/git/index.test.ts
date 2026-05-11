import { describe, test, expect, beforeEach } from 'bun:test';
import { Git, Branch, Commit } from './index';

describe('Git 类', () => {
    let git: Git;

    beforeEach(() => {
        git = new Git('test-repo');
    });

    test('初始化 Git 实例，默认分支为 main', () => {
        expect(git.head).toBeDefined();
    });

    test('commit 方法创建新的提交', () => {
        const commit = git.commit('初始提交');

        expect(commit.id).toBe('0');
        expect(commit.message).toBe('初始提交');
        expect(commit.parent).toBeNull();
    });

    test('连续提交，commit ID 递增', () => {
        const commit1 = git.commit('第一次提交');
        const commit2 = git.commit('第二次提交');
        const commit3 = git.commit('第三次提交');

        expect(commit1.id).toBe('0');
        expect(commit2.id).toBe('1');
        expect(commit3.id).toBe('2');
    });

    test('提交链正确链接', () => {
        const commit1 = git.commit('第一次提交');
        const commit2 = git.commit('第二次提交');
        const commit3 = git.commit('第三次提交');

        expect(commit2.parent).toBe(commit1);
        expect(commit3.parent).toBe(commit2);
    });

    test('checkout 切换到已存在的分支', () => {
        const mainBranch = git.head;

        git.checkout('main');
        expect(git.head).toBe(mainBranch);
    });

    test('checkout 创建新分支', () => {
        git.commit('初始提交');
        const newBranch = git.checkout('feature');

        expect(newBranch).toBeDefined();
        expect(git.head).toBe(newBranch);
    });

    test('新分支从当前分支的 commit 开始', () => {
        const commit = git.commit('初始提交');
        const newBranch = git.checkout('feature');

        expect(newBranch.lastCommit).toBe(commit);
    });

    test('在不同分支提交互不影响', () => {
        git.commit('main 分支提交 1');
        git.checkout('feature');
        git.commit('feature 分支提交');
        git.checkout('main');
        const mainCommit = git.commit('main 分支提交 2');

        expect(mainCommit.id).toBe('2');
        expect(mainCommit.parent!.id).toBe('0');
    });
});

describe('Branch 类', () => {
    test('创建分支并获取名称', () => {
        const branch = new Branch('main', null);

        expect(branch.lastCommit).toBeNull();
    });

    test('分支可以设置 commit', () => {
        const commit = new Commit('0', null, '测试提交');
        const branch = new Branch('main', commit);

        expect(branch.lastCommit).toBe(commit);
    });

    test('pushCommit 更新分支的 commit', () => {
        const branch = new Branch('main', null);
        const commit1 = new Commit('0', null, '第一次提交');
        const commit2 = new Commit('1', commit1, '第二次提交');

        branch.pushCommit(commit1);
        expect(branch.lastCommit).toBe(commit1);

        branch.pushCommit(commit2);
        expect(branch.lastCommit).toBe(commit2);
    });
});

describe('Commit 类', () => {
    test('创建提交并获取属性', () => {
        const commit = new Commit('abc123', null, '测试消息');

        expect(commit.id).toBe('abc123');
        expect(commit.message).toBe('测试消息');
        expect(commit.parent).toBeNull();
    });

    test('提交可以有父提交', () => {
        const parentCommit = new Commit('0', null, '父提交');
        const childCommit = new Commit('1', parentCommit, '子提交');

        expect(childCommit.parent).toBe(parentCommit);
        expect(childCommit.parent!.id).toBe('0');
    });

    test('提交链可以追溯到根提交', () => {
        const commit1 = new Commit('0', null, '提交 1');
        const commit2 = new Commit('1', commit1, '提交 2');
        const commit3 = new Commit('2', commit2, '提交 3');

        expect(commit3.parent).toBe(commit2);
        expect(commit3.parent!.parent).toBe(commit1);
        expect(commit3.parent!.parent!.parent).toBeNull();
    });
});
