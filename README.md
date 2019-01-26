# rain.js

一个简单的下雨效果

参考自 https://imweb.io/topic/55e32fd5771670e207a16bb9

初始化

```
Rain({ 
  speed: [10,100], // 风速范围
  hasBounce: true, // 是否有回弹效果
  wind_direction: 230, // 风向
  gravity: 0.163, // 重力
  maxNum: 1000, // 雨滴最大数量
  numLevel: 10, // 每次生成雨滴数量
  drop_chance: 0.4 // 下雨的概率
});
```
