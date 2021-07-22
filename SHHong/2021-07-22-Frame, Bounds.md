---
layout : single
title : Frame과 Bounds
---

# Frame과 Bounds의 차이 

Frame과 Bounds는 UIView의 instance property로 둘 다 CGRect이다. 

여기서 CGRect을 간단히 설명하자면 구조체로서 구조체 변수로 CGPoint, CGSize를 갖고 있다. 따라서 자신의 위치(CGPoint)를 갖는 가로와 세로 길이가 존재(CGSize)하는 사각형이다. 여기서 CGPoint는 사각형기준 왼쪽 위의 점을 기준으로 하며 (0, 0) 기준으로 양의 방향은 x축 오른쪽, y축 <u>아래쪽</u>이다.

그렇다면 차이는 무엇일까? 

App 개발자 문서에는 다음과 같이 나와있다. 

<img width="773" alt="image-20210722142131925" src="https://user-images.githubusercontent.com/78390837/126594201-65a68deb-8a92-4639-b971-1015399d4b4d.png" style="zoom: 67%;" >

Bounds: **자기 자신의 좌표계**에서 해당 view의 위치와 크기를 나타내는 사각형

<img width="563" alt="image-20210605175638277" src="https://user-images.githubusercontent.com/78390837/126594189-fcd9b7a9-53d2-4055-8310-a92b3d33f7da.png"  >

Frame: superview(상위뷰)의 좌표계에서 해당 view의 위치와 크기를 나타내는 사각형



여기서 드는 의문점은 

1. 자기 자신의 좌표계란 무엇인가?
2. 상위뷰를 기준으로 위치와 크기를 나타낸다고 했는데 그 위치를 나타내는 값의 크기는 상위뷰의 크기와 상관이 없는가 그와 유사하게 크기 또한 상대적인 수치인가 절대적인 수치인가? 

XCode에서 살펴보자.

```swift
import UIKit

class ViewController: UIViewController {

    var superView = UIView()
    var subView = UIView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .red
        superView.frame = CGRect(x: 25, y: 25, width: 25, height: 25)
        superView.backgroundColor = .yellow
        
        subView.frame = CGRect(x: 25, y: 25, width: 50, height: 50)
        subView.backgroundColor = .green
        
        view.addSubview(superView)
        superView.addSubview(subView)
    }
}
```

<img src="https://user-images.githubusercontent.com/78390837/126594190-52651507-fd6e-4a75-9c28-16a6e5d212b7.png" alt="image-20210605191107510" style="zoom: 33%;" />

위 코드로 알게 된 점은 2번 질문에 관한 것인데 수치는 절대적인 값이다. 만일 view 보다 yellow인 superView의 Size가 더 크다면 화면을 넘어가게 된다. (여기서 화면의 크기는 iPhone 11기준 width: 414, height: 819)

이번에는 bound에 대한 실험을 해보자. 

```swift
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .red

        yelloewView.backgroundColor = .yellow
        greenView.backgroundColor = .green
        blackView.backgroundColor = .black

        yelloewView.frame = CGRect(x: 50, y: 50, width: 200, height: 200)
        greenView.frame = CGRect(x: 100, y: 100, width: 100, height: 100)
        blackView.frame = CGRect(x: 200, y: 200, width: 50, height: 50)

        UIViewPropertyAnimator(duration: 3, curve: .easeOut) {
            self.yelloewView.bounds.origin = CGPoint(x: 50, y: 50) //
            self.greenView.bounds.origin = CGPoint(x: -100, y: -100) //yellowView에 영향을 받음
//            self.view.bounds.origin = CGPoint(x: -80, y: -80)
        } .startAnimation()
        
        
//        view.addSubview(superView)
//        view.addSubview(subView)
        
        view.addSubview(yelloewView)
        yelloewView.addSubview(greenView)
        view.addSubview(blackView)
        
        print("yelloewView bound의 x, y 좌표 : \(yelloewView.bounds.origin.x), \(yelloewView.bounds.origin.y)") //yelloewView bound의 x, y 좌표 : 50.0, 50.0
        print("greenView bound의 x, y 좌표 : \(greenView.bounds.origin.x), \(greenView.bounds.origin.y)") //greenView bound의 x, y 좌표 : -100.0, -100.0

    }
    
```

<img src="https://user-images.githubusercontent.com/78390837/126594191-86a5364c-ad0a-47bc-8431-5303b4284940.png" alt="image-20210607215203371" style="zoom: 33%;" />

자기 자신의 좌표계를 사용한다고 해서 superView의 영향을 받지 않는다고 생각했다. 하지만 yellowView의 bound를 바꾸니 그 subView인 greenView가 영향을 받아 움직였다. 마치 greenView의 point는 핀으로 꽂혀있고 yellowView의 point가 (0, 0)에서 (50, 50)으로 바뀌어서 yellowView의 point가 (0, 0)이던 시점의 point를 찾아가는 것처럼 보인다. 이때 blackView는 View의 subView이므로 yellowView bound에는 영향을 받지 않는다. 



