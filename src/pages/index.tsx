// pages/index.js
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Plane } from '@react-three/drei';

type Obj = {
  id: string;
  position: [number, number, number];
  shape: string;
}

export default function Home() {
  const [objects, setObjects] = useState<Obj[]>([]);

  // ランダムな形状のオブジェクトを追加する関数
  const addRandomObject = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const position = [
      (Math.random() - 0.5) * 6, // X軸方向でランダム
      5 + Math.random() * 2,     // Y軸方向で高めの位置
      (Math.random() - 0.5) * 6, // Z軸方向でランダム
    ];

    // ランダムな形状を選択
    const shapeTypes = ['box', 'sphere', 'cone', 'torus'];
    const shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    setObjects([...objects, { id, position, shape }]);
  };

  // 任意の形状を描画するコンポーネント
  const RenderShape = ({ shape }) => {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.4, 0.15, 16, 100]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <button
        onClick={addRandomObject}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '10px 20px',
          zIndex: 1,
        }}
      >
        オブジェクトを追加
      </button>

      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        {/* 照明 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Physics gravity={[0, -9.81, 0]}>
          {/* 床 */}
          <RigidBody type="fixed">
            <Plane rotation={[-Math.PI / 2, 0, 0]} args={[10, 10]}>
              <meshStandardMaterial color="lightgray" />
            </Plane>
          </RigidBody>

          {/* 動的に生成されたオブジェクト */}
          {objects.map((obj) => (
            <RigidBody key={obj.id} position={obj.position}>
              <mesh>
                <RenderShape shape={obj.shape} />
                <meshStandardMaterial color="blue" />
              </mesh>
            </RigidBody>
          ))}
        </Physics>
      </Canvas>
    </div>
  );
}
