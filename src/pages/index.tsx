import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
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

    const generate3DModel = async () => {
        if (!prompt) return;

        setLoading(true);

        try {
            const response = await fetch(`https://9ac9-92-203-99-78.ngrok-free.app/get/3dmodel_url/${encodeURIComponent(prompt)}`, {
              redirect: 'manual',
            });
            // sleep 120s
            await new Promise((resolve) => setTimeout(resolve, 120000));
            const data = await response.json();

            const newObject: Obj = {
                id: `${objects.length}`,
                position: [Math.random() * 10, 1, Math.random() * 10],
                url: data.glb_url,
            };

            setObjects((prev) => [...prev, newObject]);
        } catch (error) {
            console.error('Error fetching 3D model:', error);
        } finally {
            setLoading(false);
        }
    };

    const RenderModel = ({ url }: { url: string }) => {
        const [model, setModel] = useState<THREE.Group | null>(null);

        useEffect(() => {
            const loader = new GLTFLoader();

            loader.load(
                url,
                (gltf) => {
                    setModel(gltf.scene);
                },
                undefined,
                (error) => {
                    console.error('Error loading GLB model:', error);
                }
            );

            return () => {
                setModel(null);
            };
        }, [url]);

        return model ? <primitive object={model} /> : null;
    };

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
                        <RigidBody key={obj.id} position={obj.position}>
                            <RenderModel url={obj.url} />
                        </RigidBody>
                    ))}
                </Physics>
            </Canvas>
        </div>
    );
}
