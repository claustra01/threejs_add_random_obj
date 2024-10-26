import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Plane } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

type Obj = {
    id: string;
    position: [number, number, number];
    url: string;
};

export default function Home() {
    const [objects, setObjects] = useState<Obj[]>([]);
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [cacheObj, setCacheObj] = useState<Obj | null>(null);

    const generate3DModel = async () => {
        if (!prompt) return;

        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8000/get/3dmodel_url/${encodeURIComponent(prompt)}`, {
              mode: 'no-cors',
            });
            const data = await response.json();

            const randInt3to5 = Math.floor(Math.random() * 3) + 3;
            const newObjects: Obj[] = Array.from({ length: randInt3to5 }, (_, i) => ({
                id: `${objects.length + i}`,
                position: [Math.random() * 10 - 5, 5, Math.random() * 10 - 5],
                url: data.glb_url,
            }));

            setCacheObj(newObjects[0]);
            setObjects((prev) => [...prev, ...newObjects]);
          } catch (error) {
              console.error('Error fetching 3D model:', error);
          } finally {
              setLoading(false);
          }
        };

        const generateCachedModel = () => {
            if (cacheObj) {
                setLoading(true);
                const randInt3to5 = Math.floor(Math.random() * 3) + 3;
                for (let i = 0; i < randInt3to5; i++) {
                    setObjects((prev) => [...prev, cacheObj]);
                }
                setLoading(false);
            }
        };

        const RenderModel = React.memo(({ url }: { url: string }) => {
          const [model, setModel] = useState<THREE.Group | null>(null);
          const [loading, setLoading] = useState(true); // Track loading state
      
          useEffect(() => {
              const loader = new GLTFLoader();
              loader.load(
                  url,
                  (gltf) => {
                      setModel(gltf.scene);
                      setLoading(false); // Model loaded
                  },
                  undefined,
                  (error) => {
                      console.error('Error loading GLB model:', error);
                      setLoading(false); // Handle error
                  }
              );
      
              return () => {
                  setModel(null);
              };
          }, [url]);
      
          if (loading) {
              return null; // Prevent rendering until the model is loaded
          }
      
          return model ? <primitive object={model} /> : null;
      });
      
    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="プロンプトを入力"
                    style={{ padding: '10px', marginRight: '10px' }}
                />
                <button
                    onClick={generate3DModel}
                    disabled={loading}
                    style={{ padding: '10px 20px' }}
                >
                    {loading ? '生成中...' : 'オブジェクトを追加'}
                </button>
                <button
                    onClick={generateCachedModel}
                    disabled={loading}
                    style={{ padding: '10px 20px' }}
                >
                    {loading ? '生成中...' : 'もっと追加！'}
                </button>
            </div>

            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />

                <Physics gravity={[0, -9.81, 0]}>
                    <RigidBody type="fixed">
                        <Plane rotation={[-Math.PI / 2, 0, 0]} args={[10, 10]}>
                            <meshStandardMaterial color="lightgray" />
                        </Plane>
                    </RigidBody>

                    {objects.map((obj) => (
                        <RigidBody key={obj.id} type="dynamic" position={obj.position}>
                            <CuboidCollider args={[1, 1, 1]} /> 
                            <RenderModel url={obj.url} />
                        </RigidBody>
                    ))}
                </Physics>
            </Canvas>
        </div>
    );
}
