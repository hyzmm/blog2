---
title: 'Git 分支迁移'
date: 2022-08-03
tags: ['git']
type: Blog
summary: '多数情况下把一个分支的提交迁移到另一个分支，通常用 `git merge` 或者 `git rebase` 就可以达到目的，但有时候实际情况会比这复杂的多。下文会基于一个真实的项目场景，说明各种情况下分支迁移的处理方式。'
---

多数情况下把一个分支的提交迁移到另一个分支，通常用 `git merge` 或者 `git rebase` 就可以达到目的，但有时候实际情况会比这复杂的多。下文会基于一个真实的项目场景，说明各种情况下分支迁移的处理方式。

假设我们正在一个项目组工作，我们的仓库分支管理模型是 GitFlow（本文会忽略 master 分支，因为它在我们的场景中没有发挥作用）。项目即将引来第一个版本发布，所以基于 develop checkout **release/1** 分支。在此期间，下个迭代的功能也在同步进行，不幸的是，项目组临时决定本属于下个迭代的需求，将会在 **release/1** 紧急发布。

现在有 3 个 feature 分支正在开发中，分别是 **feautre/a**, **feature/b**, **feature/c** 和 **feature/d**。 这 3 个分支想要合并到 **release/1** 上正好对应了 3 种情况。现在的项目进度可以在下图中清晰的了解到：

<img style={{height: 400}} src="https://mermaid.ink/svg/pako:eNp9UsFugzAM_ZXIUsUlakspoctxm7TLtstuUy4BXEADgkLY1iH-fSmMdbR0Ofk9vzzbsluIVIzAYbFoszIznLTESTLzoGWVOhY5JsUCbeTslcbaOIQSp5BZeatlGaXPckjG-I65qhxKBNSp-rhTRZGZRxliLoCTvcxr7DrSLRaiJPaNJQYU9WpRDijsnYnGHGWNK3fC7lGaRuNKzrIRUTpGzYk_mkUpRm-qMeSnw2nBGYtwtNheSqd9XrEe2bP-Jz6j5myauVqz-uiihz-ZI1-gTvA003-jDHiIgIL9adcb25NojxkB_QEclyggtPMIoAN_bc2i7KyNbIx6OZQRcKMbpKBVk6TAewWFpoqlwftMJloWvyzGmVH6aTjI_i4pVLJ8VeqksRh4C5_AN7vN0nc9xpgbMM9lNxQOwL3l1gsCn21cFqx3W3_NOgpfvYPbfQPC6PPH"/>

如果你想在本地实践一下，可以展开下列的命令，粘贴到终端，它将为你创建上图的 Git 提交历史。

> 下列命令会在当前目录创建 _demo_。

```
mkdir demo && cd demo
git init
git branch -M develop

touch a && git add . && git commit -m 'C0: commit to develop 1'

git checkout -b release/1
git checkout -b feature/a
git checkout -b feature/c

git checkout develop
touch b && git add . && git commit -m 'C1: commit to develop 1'

git checkout release/1
touch c && git add . && git commit -m 'C2: commit to release/1'

git checkout feature/a
touch d && git add . && git commit -m 'C3: start feature/a'
touch e && git add . && git commit -m 'C4: finish feature/a'
git checkout develop

git checkout -b feature/b
touch f && git add . && git commit -m 'C5: start feature/b'
touch g && git add . && git commit -m 'C6: finish feature/b'

git checkout feature/c
touch h && git add . && git commit -am 'C7: start feature/c'
git merge feature/b
touch i && git add . && git commit -am 'C8: finish feature/c'
```

分别来看下这 3 个分支迁移到 **release/1** 会碰到什么问题。

## 迁移 **feature/a**

下图仅展示了我们关注的分支，隐藏了无关分支。

<img style={{height: 250}} src="https://mermaid.ink/svg/pako:eNptUU1PwzAM_SuRpSqXalvXLR05AhInuHBDuXitt0asSZWliFH1v5N-7IOJXOL3_Pxs2S3ktiCQEEWtNtpL1jK-1_7FYV3ygLgvqaIQ8Z11dPScxYxXqM2jQ5OXbzgmC_qig61517EuipRh4Z1tRpTbqtJemRGx7VDOHB0IjzRPRnpid4S-cTTHszwvKf-0jWdTn7-WfXynu_O9VV40N12uGqYLyRQ8pQr-o1cTfR6s_5WBGCpyYStF2GTbZxQMe1PQV23DJH1dF3TYePt-MjlI7xqKwdlmX4Lc4eEYUFMX6OlZ495hdWGp0N661_FQw71iqNF8WHvVBAyyhW-Qy81ytk5SIUSSiTQRDzGcQKazVZpla7FMRLbYrNYL0cXwMzgk3S89IqJq"/>

这种情况最简单，**feature/a** 和 **release/1** 来自相同的父分支，提交记录比较清晰干净，从图中也能直观地看出，这种情况，可以通过 merge 或者 rebase 任意一种方式完成迁移。

```shell
# merge
git checkout release/1
git merge feature/a
# rebase
git checkout feature/a
git rebase release/1
git checkout release/1
git merge feature/a
```

这两种方式都能够让 **release/1** 分支拥有 **feature/a** 分支的 **foo** 提交。以 `rebase` 为例，此时的 `git log` 如下：

```shell
Updating 8b6f5db..9d50199
Fast-forward
a51ff94 (HEAD -> release/1, feature/a) C4: finish feature/a
c05dc81 C3: start feature/a
586a845 C2: commit to release/1
5005f0c (develop) C0: commit to develop 1
```

此时的提交历史图为：
<img style={{height: 250}} src="https://mermaid.ink/svg/pako:eNp1UcFOwzAM_ZXIUpVLta3rlo4cAWlDAi5wQrlkrbtGrEmVpYhR9d9J2xXGNCJF8Xt5fo7jBlKTIXAIgkZp5ThpCN0pt7ayKqhH1BVYoo9obiweHCUhoaVU-tZKnRbPcrjM8AP3pqJtS9ogEJr4NdoMKDVlqZzQAyLbPp1Y3KM84DQa6BObo3S1xakc5WmB6bupHTnV-WvZxRe6C99z5RATlXEi4C6mAog7VsjJ5mG9efT79Zpu8b9urHn26it1BFy1PdFjo90pNIRQovW_nPnJNN2NgH4OArqsre-sy2u9TtbOvBx1CtzZGkOwpt4VwHO5P3hUV5l0eK_kzsryh8VMOWOfhsH38w-hkvrNmF-Nx8Ab-AQ-X80nyyhmjEUJiyN2E8IReDxZxEmyZPOIJbPVYjljbQhfvUPUfgM5crl5"/>

结果是一个线性的提交历史，使用 `git merge` 将会得到一样的提交内容，不过提交历史会稍有不同。

<img style={{height: 250}} src="https://mermaid.ink/svg/pako:eNp9UctugzAQ_BVrJeQLSgIkJvWxrdRTe-mt8sWBDVgFGxlTNUX8ew3k1bSqL96ZHc_Iuz1kJkfgEAS90spx0hNaKPdkZVNSj6grsUZf0b2x2DpKQkJrqfS9lTorX-TczPEDK9PQYSBDEAhN_DnZzCgzda2c0DMiu-k5sVihbHEZzfSR3aN0ncWlPMmzErN30zlyzPlpOdY3uhvfa-VZc5Vy0RCVcyLgIRHwF70e6f-zarQF_v7CeAsNIfi-n1_uZ96PHQHThAWM_jvvMyYMXic7Z14POgPubIchWNMVJfC9rFqPuiaXDh-VLKyszyzmyhn7PK902mwIjdRvxlw0HgPv4RN4vI0XmyhhjEUpSyJ2F8IBeLJYJ2m6YXHE0tV2vVmxIYSvySEavgGGhbEB"/>

## 迁移 **feature/b**

注意这个用例，**feature/b** 和 **release/1** 并非来自相同的父节点。下图仅展示了我们关注的分支，隐藏了无关分支。

<img style={{height: 250}} src="https://mermaid.ink/svg/pako:eNptkTFPwzAQhf-KdVKUxSpN0zjFI0ViARY25MWJr41FYkeuA5Qo_x0naQtFePK9e-_z6dxDaRUChyjqtdGek57Ee-0fnGyrOFSxr7DBcIt31uHBx4SSuJHa3DlpyupZzk2F71jbNh4GMkSRMCScM2auSts02gszV8WUJg5rlAe8SSb1ZKywfLOdJyfm7zjRihMB20TAFWeH0ncObwpinULHyfq_VHZOXctslP-8fT3YZfjLkGNAGKDQoAvbUGGD_dgRMO1LwEguAkEAnfVDZT-2E-ZRFliPjp2sg8EMASM7b1-OpgTuXYcUnO32FfDJQaFrlfR4r-XeyeaiotLeuqf5_6ZvpNBK82rtjyfUwHv4BL7arBZZkjLGkpylCbulcASeLtZpnmdslbB8uVlnSzZQ-JoIyfAN5kOpSw"/>

假设我们采用上面说的那种方式来合并会发生什么事？由于 **feature/b** 包含 **C1** 提交，如果直接 merge 或 rebase 会导致 **C1** 也被包含在了 **release/1**。 但是 **C1** 不属于 **feature/b**，它是 **develop** 的日常事务提交。也就是说，我们需要排除 **C1**，仅让 **C5** 和 **C6** 被迁移至 **release/1**。

`git log origin..HEAD` 是个简写后的指令，它的原指令更清晰地表达了它的意图： `git log HEAD ^origin`。通过对比 **develop** 和 **feature/b** 两个分支，可以得到 **feature/b** 所拥有的，**develop** 没有的 commits。

```shell
$ git log develop..feature/b --oneline
0bbb1f9 (HEAD -> feature/b) C6: finish feature/b
dcd6f2b C5: start feature/b
```

从结果可以看出，我们只拿到了 **C5** 和 **C6** 这两个提交。我们需要把这两个提交 `cherry-pick` 到 `release/1` 分支，由于 `cherry-pick` 要按时间进行，所以我们需要拿到由先到后的 commit hash。使用上面的参数，通过 `git rev-list` 可以得到：

```shell
$ git rev-list --reverse develop..feature/b
dcd6f2bd33d1e7dbfc612befb596f0c6c27174dc
0bbb1f987dc3e186c9a8c45ab3e4bf2bee7c2905
```

由于 **cherry-pick** 可以接收多个 commit hash，以空格分隔，所以还需将上述输出结果改为以空格分隔的字符串：

```shell
$ git rev-list --reverse develop..feature/b | xargs
dcd6f2bd33d1e7dbfc612befb596f0c6c27174dc 0bbb1f987dc3e186c9a8c45ab3e4bf2bee7c2905
```

接着就是让 **release/1** `cherry-pick` 这些 commits 了，最终的命令是：

```shell
# 确保处于 release/1 分支
$ git checkout release/1
$ git rev-list --reverse \develop..feature/b \
| xargs \
| xargs git cherry-pick
```

现在使用 `git-log` 查看 **release/1** 的 commits 可以看到只有 **C0**、**C2**、**C5**、**C6**。

```shell
246a5eb (HEAD -> release/1) C6: finish feature/b
f61a851 C5: start feature/b
4009214 C2: commit to release/1
4bfed4c C0: commit to develop 1
```

此时的提示历史图为：

<img style={{height: 250}} src="https://mermaid.ink/svg/pako:eNp1UlFPgzAQ_ivNJYSXZo4xyuyjM9lMpi_6ZPpS4DaI0JKuqJPw3y2wTWdmkya9777vu8v1Wkh1hsDB89pCFZaTlvi7wq6MrHPfRb7NsUL38rfa4N76hBK_koW6M1Kl-ZMckxm-Y6lrv-tI53lCEXdONmOU6qoqrFBjlAxqYrBEucebYECPxBzTN91YcvT8LSdFxomAZSDgwmeL0jYGbxKiTYaGk_k1VXRSXcKsh__Uvmzs3PwVT18AsYcaOVk_rNYbd1-uFvmPN5L7BoQCChUaN93M_UjbZwQM8xfQmySuIwF0xPe5_lgOJTYywbJnbGXpCKpzNrKx-vmgUuDWNEjB6GaXAx8YFJo6kxbvC7kzsjqjmBVWm8dxH4a1oFBL9ar1D8fFwFv4BD5bzCZREDLGgpiFAbulcAAeTuZhHEdsFrB4uphHU9ZR-Bocgu4b81rAXg"/>

## 迁移 **feature/c**

下图仅展示了我们关注的分支，隐藏了无关分支。
<img style={{height: 320}} src="https://mermaid.ink/svg/pako:eNp1kjFvgzAQhf-KdRJiQUkIwaQem0pd2i7dKhYDF7AKNnJM2xTx32ugJKFJPfnevfv8pHMLqcoQGDhOK6QwjLTEzYV51LwuXFu5psAK7c3dK40H4xKPuBUX8l5zmRYvfGxm-IGlqt2uI53jxJLYM2HGKlVVJUwsxyoZponGEvkBl_5M3SM3jcZlSpTOUDMSTmNpgem7agz5fW-OvoFIJsTm2jpP9A96Uv8knXEmzyn3FfOi0-sV6hzPGS-RRGSMxLCLYrglb3t5wo838MDy7Eoyu8a278QwLC2GfiSxqWPwRv1QqM_dAHziCZa9Y89La5CdxfDGqNejTIEZ3aAHWjV5AWxweNDUGTf4IHiueXVSMRNG6efxEw1_yYOayzelzh5bA2vhC9h6u16EfkAp9SMa-PTOgyOwYLEJoiika59Gq-0mXNHOg--B4Hc_B9rYVQ"/>

**feature/c** 的情况更复杂了，它曾经合并过其他分支，属于 **feature/c** 的直属提交只有 **C5** 和 **C6**。

> 如果实际上 **feautre/b** 是 **feature/c** 的前置特性，想要正常使用 **feature/c** 必须带上 **feature/b**，那 **release/1** 就同时需要 **feautre/b** 和 **feature/c**，这样的话，用上一节的方式就可以了。
>
> 这里我们关注另外一种情况，继续阅读。

在开发 **feature/c** 的过程中，开发人员出于某种原因，合并了 **feature/b**，但现在要紧急发布此功能，就必须剔除 **feature/b** 的 commits，我们只希望迁移 **C7** 和 **C8**。

分支被 `merge` 指令合并时，会产生一次新的合并提交，就是上图 **C7** 和 **C8** 中间的那个 commit，它会记录自身的父分支，通常第一父分支是执行合并时所处的分支，我们要获取到它的第一父分支（**feature/c**）上的提交可以用这种方式：

```shell
$ git log develop..feature/c --first-parent --oneline
774b57d (feature/c) C8: finish feature/c
f37b176 Merge branch 'feature/b' into feature/c
e66ee72 C7: start feature/c
```

结果我们得到了三个提交，除了 **C7** 和 **C8**，还包含一个合并提交，去掉这个提交可以通过 `--no-merges` 选项：

```shell
$ git log develop..feature/c --first-parent --oneline --no-merges
774b57d (feature/c) C8: finish feature/c
e66ee72 C7: start feature/c
```

现在的结果是期望的了，像上一节一样，把 `git-log` 换成 `git rev-list` 获取倒序的 commit hash，并转换格式后执行 `chery-pick`，最终的指令是：

```shell
# 确保正处于 release/1 分支
git checkout release/1
git rev-list \
	--reverse \
	--first-parent \
	--no-merges \
	develop..feature/c  \
| xargs \
| xargs git cherry-pick
```

此时，使用 `git log` 查看提交记录，可以看到当前有 **C0**、**C2**、**C7**、**C8** 这些提交。

现在的提交历史图是这样的：

<img style={{height: 320}} src="https://mermaid.ink/svg/pako:eNqNklFrgzAUhf9KuCB5ka7Wql0e10E76PayPQ1fot6qTI2kcVsn_vdFnW1dHSwQyD0598uB3BpCESEwMIw6LVLFSE1onKqN5GVCdUVVgjnqE90LiQdFiUloztPiTvIiTJ54fxnhO2aipE1DGsPwC6LXgOmrUOR5qvyir4Kum0jMkB_wxhqpe-SqkngTEiEjlIw4Q1uYYPgmKkV-3hujJxDBgFheW8eJ_kAP6q-kI87gOeW-Yl7ctHqOMsZzxkskSSNGfFh7PkzJq1b-T7QTh_pA1LFERrYPm-1O75dJ8IQPTNBJ9WdHekDqtsuHbhx8aHsC_agPZq8fEvGx7og7HmDWOvY804ai0RheKfF8LEJgSlZoghRVnADrHCZUZcQV3qc8ljw_qRilSsjHfjy7KTWh5MWrEGeProHV8AlssVrMHMt2XdfyXNtyb004ArNnS9vzHHdhud58tXTmbmPCV0ewmm_PHPL7"/>

### 跳过等效提交

上面我们用来过滤出需要被迁移的 commits 的命令，在上例的情况下，还有一个等效的命令：

```shell
git log develop..feature/c --first-parent --oneline --no-merges
# 等效于
git log develop...feature/c --first-parent --oneline --no-merges
```

区别仅是，两个分支名之前的符号变成了三个点。它也是缩写，原始命令是：

```shell
git log A B --not $(git merge-base --all A B)
```

`git merge-base` 能够输出 A B 两个分支点的合并基，在本文的提交历史中，**develop** 和 **feature/c** 的共同祖先有 **C0** 和 **C1**，`merge-base` 会取出最近的 **C1**。整行命令就是列出 A 和 B 分支的对称差异，即仅属于 A 和 B 的提交。

接着在 **feature/c** 这个例子的基础上做一个小小的改动，如果你用最上面的命令在本地重现了实践环境，那么需要删除之前创建的 demo 文件夹，重来一次，并在之前的基础上多执行一行命令：

```shell
git checkout release/1
git rev-list feature/c --no-merges -n 1 --skip=1 | xargs git cherry-pick
```

现在提交历史如下图所示：
<img style={{height: 320}} src="https://mermaid.ink/svg/pako:eNqNklFrgzAUhf9KuFB8CV2tVbs8roN20O1lexq-RL3VMDWSxm2d-N8XdbZ17WCC4D055_PATQ2RjBEYTCa1KIRmpCZWIvRa8TK1zGTpFHM0X9ZOKtxri1Bi5VwUd4oXUfrE-8MY3zGTpdU0pJlMgoKYZ8D0UyTzXOig6KewSxOFGfI93tgjdYdcVwpvIiJVjIoRd4hFKUZvstLk539j9BVEOCAWl9Zxoz_Qg_qr6YgzeI69L5hnJ62eo0rw1PEcSUTMSAArP4Br8rKV_1PtGLACIPpQIiObh_Vma94XoGAamCXGZvF1mwqgW3MAbSY0sABor-9T-bHqiFseYtY6djwzhqIxGF5p-XwoImBaVUhBySpJgXUOClUZc433gieK50cVY6GleuyvXXf7KJS8eJXy5DEzsBo-gc2X86lrO57n2b7n2N4thQMwZ7pwfN_15rbnz5YLd-Y1FL46gt18A3sK53A"/>

**release/1** 已经拥有了 **feature/c** 的 **C7** 提交，对应到现实中的场景，这可以是一个 hot-fix。现在 **feature/c** 中需要被迁移到 **release/1** 的提交只剩下 C8 了，如果用本节上面介绍的迁移迁移方式，也不会出问题，它会 `cherry-pick` **C7** 和 C8，其中 **C7** 是重复的，不过 Git 能够识别出来，并会提示：

```shell
On branch release/1
You are currently cherry-picking commit fafd483.
  (all conflicts fixed: run "git cherry-pick --continue")
  (use "git cherry-pick --skip" to skip this patch)
  (use "git cherry-pick --abort" to cancel the cherry-pick operation)

nothing to commit, working tree clean
The previous cherry-pick is now empty, possibly due to conflict resolution.
If you wish to commit it anyway, use:

    git commit --allow-empty

Otherwise, please use 'git cherry-pick --skip'
```

这种情况可以直接执行 `git cherry-pick --skip` 跳过。不过我们依然有办法能够过滤掉重复的 **C7**。之前我们一直是对比 **develop** 和 **feature** 分支，但现在 **feature/\*** 是基于 **develop** 的，重复的 **C7** 是在 **release/1** 确是上的，所以需要换个方式。

```shell
$ git log release/1...feature/c --first-parent --oneline --no-merges --cherry-mark
= 1141483 (HEAD -> release/1) C7: start feature/c
+ 873023c (feature/c) C8: finish feature/c
+ 5e2c875 C2: commit to release/1
= fafd483 C7: start feature/c
```

根据刚刚的介绍，我们得出的意料之内的属于 **release/1** 和 **feature/c** 的提交。这里多了一个参数 `--cherry-mark` ，它会使输出结果前面加上一些标记，`=` 表示已经有等效提交了，即可以忽略的，`+` 表示非等效提交。另一个类似的参数是 `--cherry-pick`，它与 `--cherry-mark` 的区别是会忽略掉等效提交。

```shell
$ git log release/1...feature/c --first-parent --oneline --no-merges --cherry-pick
873023c (feature/c) C8: finish feature/c
5e2c875 C2: commit to release/1
```

最后还需要过滤掉 **C2** 这样的属于 **release/1** 的提交：

```shell
$ git log release/1...feature/c --first-parent --oneline --no-merges --cherry-pick --right-only
873023c (feature/c) C8: finish feature/c
```

通过 `--right-only` 可以仅列出 `...` 右侧分支的提交，与之类似的还有 `--left-only` 和 `--left-right`，顾名思义，不再赘述。

完整的指令是：

```shell
git rev-list --reverse release/1...feature/c --first-parent --no-merges --cherry-pick --right-only \
| xargs \
| xargs git cherry-pick
```

## 小结

概括一下要点：

- 排除合并进来的分支使用 `--first-parent`
- 排除合并产生的提交使用 `--no-merges`
- 将从 A checkout 出来的 B 分支合并至 C，可以使用 `...` 标记版本范围
  - 使用 `--cherry-pick` 检查对称差异性
  - 使用 `--right-only` 挑选右侧分支的提交

如果继续寻找特例肯定还能找到上述未涉及的情况，不过理解了这些指令后，也能够自己得出答案了。文中的示例都是基于我们一开始给出的 Git 提交历史图，如果实际案例情况更复杂，加上提交历史混乱，那么 Git 管理员将会看到一团乱麻，无从下手。所以平时开发者就需要注意 Pull Request 的提交历史，避免此类情况。
