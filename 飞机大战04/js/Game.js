//构造函数  构造游戏
function Game(container) {
   this.container = document.querySelector(container);
   this.startLeft = this.container.offsetLeft;
   this.startTop = this.container.offsetTop;
   this.width = this.container.clientWidth;
   this.height = this.container.clientHeight;
   this.level = ['简单', '中等', '困难', '噩梦'];
   this.score = 0; //存储分数

   //敌军的生成速度
   this.creatEnemySpeed = [1000, 600, 300, 100]
   this.init();
}

Game.prototype = {

   // init函数的作用：初始化游戏界面
   init: function () {
      this.title = document.createElement('h2');
      this.title.innerText = '飞机大战';
      this.container.appendChild(this.title);

      this.oUl = document.createElement('ul');

      for (let i = 0; i < this.level.length; i++) {
         let oli = document.createElement('li');
         oli.innerText = this.level[i];
         this.oUl.appendChild(oli)
      }
      this.container.appendChild(this.oUl);

      //事件委托  bind修改事件处理函数的this指向
      this.oUl.addEventListener('click', this.handleClick.bind(this), false)

      this.changeBg(1);

   },

   handleClick: function (e) {

      //如果点击的是ul  直接return
      if (e.target.nodeName === 'UL') return;
      //this.oUl.children 这个类数组调用数组的indexOf方法
      let index = [].indexOf.call(this.oUl.children, e.target);
      this.changeBg(index + 1);
      this.gameStart(e, index);
   },

   //修改背景图片
   changeBg: function (i) {
      this.container.style.backgroundImage = 'url(images/bg_' + i + '.jpg';
   },

   //开始游戏
   gameStart: function (e, index) {
      this.container.innerText = '';//清空初始化界面

      this.createPlane(e);

      //创建盛放分数的标签
      this.scoreContainer = document.createElement('span');
      this.scoreContainer.className = 'scoreContainer';
      this.container.appendChild(this.scoreContainer)
      this.bulletList = [];   //存放所有生成的子弹
      this.enemyList = [];    //存放所有的敌军

      this.createBulletTimer = setInterval(this.createBullet.bind(this), 100);
      this.bulletsMoveTimer = setInterval(this.bulletsMove.bind(this), 50);

      this.createEnemyTimer = setInterval(this.createEnemy.bind(this), this.creatEnemySpeed[index]);
      this.enemysMoveTimer = setInterval(this.enemysMove.bind(this), 20)
      document.addEventListener('mousemove', this.handleMouse.bind(this), false)
   },

   //创建plane
   createPlane: function (e) {
      this.plane = document.createElement('div');
      this.plane.className = 'plane';
      this.container.appendChild(this.plane);
      //console.log(e.clientX,e.clientY);
      //修正plane的初始位置
      this.plane.style.left = e.clientX - this.startLeft - this.plane.clientWidth / 2 + 'px';
      this.plane.style.top = e.clientY - this.startTop - this.plane.clientHeight / 2 + 'px';
   },

   //创建子弹
   createBullet: function () {
      this.bullet = document.createElement('div');
      this.bullet.className = 'bullet';
      //想要获取bullet的宽高  必须先添加到dom树中
      this.container.appendChild(this.bullet);
      this.bullet.style.left = this.plane.offsetLeft + (this.plane.clientWidth - this.bullet.clientWidth) / 2 + 'px';
      this.bullet.style.top = this.plane.offsetTop - this.bullet.clientHeight + 'px';
      //向子弹库里面填充所有的子弹
      this.bulletList.push(this.bullet);
   },

   //子弹运动
   bulletsMove: function () {

      for (let i = 0; i < this.bulletList.length; i++) {
         let bullet = this.bulletList[i];
         bullet.style.top = bullet.offsetTop - 20 + 'px';
         //子弹超过上边界 那就删掉从dom树中删掉子弹
         if (bullet.offsetTop < 0) {
            bullet.parentNode.removeChild(bullet);
            this.bulletList.splice(i, 1);
            i--;    //解决数组坍塌
         }


         for (let j = 0; j < this.enemyList.length; j++) {
            let enemy = this.enemyList[j];

            if (this.crash(bullet, enemy)) {   //如果子弹和敌军相撞了
               this.score = this.score + 10;
               this.scoreContainer.innerText = this.score + '分'
               //加分
               this.boom = document.createElement('div');
               this.boom.className = 'boom';
               this.container.appendChild(this.boom);
               this.boom.style.left = enemy.offsetLeft + 'px';
               this.boom.style.top = enemy.offsetTop + 'px';

               //使用运动框架 让爆炸图opacity变成0
               animation(this.boom, {
                  opacity: 0
               }, 1, function () {
                  //把爆炸图从dom树中删除
                  this.parentNode.removeChild(this)
               })
               bullet.parentNode.removeChild(bullet);
               this.bulletList.splice(i, 1);
               i--;
               enemy.parentNode.removeChild(enemy);
               this.enemyList.splice(j, 1);
               j--;
            }
         }
      }
   },

   //创建敌军
   createEnemy: function () {
      this.enemy = document.createElement('div');
      this.enemy.className = 'enemy';

      this.container.appendChild(this.enemy);

      //设置飞机的初始位置
      this.enemy.style.left = (this.width - this.enemy.clientWidth) * Math.random() + 'px';
      this.enemyList.push(this.enemy)

   },

   //敌军运动
   enemysMove: function () {
      //console.log('enemysMove',this.enemyList);
      for (let i = 0; i < this.enemyList.length; i++) {
         let enemy = this.enemyList[i];
         enemy.style.top = enemy.offsetTop + 10 + 'px';
         if (enemy.offsetTop > this.height) {
            enemy.parentNode.removeChild(enemy);
            this.enemyList.splice(i, 1);
            i--;
         }

         //检测敌军和我军的碰撞
         if (enemy.parentNode && this.crash(enemy, this.plane)) {
            let boom = document.createElement('div');
            boom.className = 'planeBoom';
            this.container.appendChild(boom);
            boom.style.left = enemy.offsetLeft + 'px'
            boom.style.top = enemy.offsetTop + 'px';

            //使用运动框架 让爆炸图opacity变成0
            animation(boom, {
               opacity: 0,
            }, 1, function () {
               //把爆炸图从dom树中删除
               boom.parentNode.removeChild(boom);
               //执行游戏结束函数
               this.gameOver()
            }.bind(this))
            enemy.parentNode.removeChild(enemy);
            this.enemyList.splice(i, 1);
            i--;
            this.plane.parentNode.removeChild(this.plane);
         }
      }
   },

   //游戏结束
   gameOver: function () {
      //关闭生成子弹和敌军的定时器
      clearInterval(this.createBulletTimer);
      clearInterval(this.createEnemyTimer);
      setTimeout(this.alertInterFace.bind(this), 1000)
   },

   //弹出游戏失败界面
   alertInterFace: function () {
      let interFace = document.createElement('div');
      interFace.className = 'interFace';
      //创建重新开始游戏的按钮
      let btn = document.createElement('button');
      btn.innerText = '重新开始';
      btn.addEventListener('click', this.handleBtnClick.bind(this), false)
      interFace.appendChild(btn)
      this.container.appendChild(interFace);
   },

   //重新开始游戏按钮的事件处理函数
   handleBtnClick: function () {
      this.container.innerText = '';
      new Game('#box');
   },
   handleMouse: function (e) {
      let nowLeft = e.clientX - this.startLeft - this.plane.clientWidth / 2;
      let nowTop = e.clientY - this.startTop - this.plane.clientHeight / 2;
      //plane的边界检测
      nowLeft = Math.max(0, nowLeft);
      nowLeft = Math.min(this.width - this.plane.clientWidth, nowLeft);
      nowTop = Math.max(0, nowTop);
      nowTop = Math.min(this.height - this.plane.clientHeight, nowTop);
      this.plane.style.left = nowLeft + 'px';
      this.plane.style.top = nowTop + 'px';
   },

   //检测两个dom元素是否碰撞
   crash: function (dom1, dom2) {
      let bool =
         dom1.offsetTop + dom1.clientHeight < dom2.offsetTop ||
         dom1.offsetTop > dom2.offsetTop + dom2.clientHeight ||
         dom1.offsetLeft + dom1.clientWidth < dom2.offsetLeft ||
         dom1.offsetLeft > dom2.offsetLeft + dom2.clientWidth;

      return !bool;
   }
}

const game = new Game('#box');