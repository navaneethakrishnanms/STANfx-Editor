import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { MainSelector } from './components/MainSelector';
import { CollageCreator } from './components/collage/CollageCreator';
import { EditorPanel } from './components/EditorPanel';
import { Gallery } from './components/Gallery';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import { TextToImage } from './components/TextToImage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { editImageWithGemini } from './services/geminiService';
import type { EditedImage, ImageFile, User } from './types';

type AppState = 'login' | 'select' | 'edit' | 'collage' | 't2i' | 'admin';

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);

const App: React.FC = () => {
  const [currentUsername, setCurrentUsername] = useLocalStorage<string | null>('currentUser', null);
  const [allUsers, setAllUsers] = useLocalStorage<User[]>('app_users', []);
  
  const currentUser = useMemo(() => allUsers.find(u => u.username === currentUsername) || null, [allUsers, currentUsername]);

  const [appState, setAppState] = useState<AppState>(currentUser ? 'select' : 'login');
  
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allGalleries, setAllGalleries] = useLocalStorage<Record<string, EditedImage[]>>('allUserGalleries', {});

  const galleryImages = currentUsername ? allGalleries[currentUsername] || [] : [];

  const handleLogin = (username: string) => {
    setCurrentUsername(username);
    setAppState('select');
  };
  
  const handleLogout = () => {
    setCurrentUsername(null);
    setAppState('login');
    handleClear(true); // Also clear the editor state on logout
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImageFile({
        base64: dataUrl.split(',')[1],
        mimeType: file.type,
        name: file.name
      });
      setCurrentImageSrc(dataUrl);
      setError(null);
      setAppState('edit');
    };
    reader.onerror = () => {
      setError("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  };
  
  const handleAIPromptEdit = useCallback(async (canvasState: { base64: string, mimeType: string }) => {
    if (!prompt) {
      setError("Please enter an editing prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newImageBase64 = await editImageWithGemini(canvasState.base64, canvasState.mimeType, prompt);
      const newImageSrc = `data:${canvasState.mimeType};base64,${newImageBase64}`;
      setCurrentImageSrc(newImageSrc);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`AI edit failed. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleSaveToGallery = (canvasDataUrl: string) => {
    if (!canvasDataUrl || !currentUsername) return;
    const newImage: EditedImage = {
      id: new Date().toISOString(),
      src: canvasDataUrl,
      prompt: prompt || 'Client-side edit',
      originalName: imageFile?.name || 'edited-image'
    };
    const currentUserGallery = allGalleries[currentUsername] || [];
    setAllGalleries({
      ...allGalleries,
      [currentUsername]: [newImage, ...currentUserGallery]
    });
  };

  const handleClear = (isLoggingOut = false) => {
    setImageFile(null);
    setCurrentImageSrc(null);
    setPrompt('');
    setError(null);
    if (!isLoggingOut) {
       setAppState('select');
    }
  }

  const handleStartCollage = () => {
      setAppState('collage');
  }

  const handleStartTextToImage = () => {
      setAppState('t2i');
  }
  
  const handleCollageFinalized = (dataUrl: string) => {
      setImageFile({
          base64: dataUrl.split(',')[1],
          mimeType: 'image/png',
          name: `collage-${Date.now()}.png`
      });
      setCurrentImageSrc(dataUrl);
      setError(null);
      setAppState('edit');
  }
  
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={allUsers} setUsers={setAllUsers} />;
  }

  return (
    <div className="min-h-screen">
      <Header currentUser={currentUser} onLogout={handleLogout} onGoToAdmin={() => setAppState('admin')} />
      <main className="container mx-auto p-4 md:p-12">
        {appState === 'admin' ? (
           <AdminPanel allUsers={allUsers} setAllUsers={setAllUsers} currentUser={currentUser} onBack={() => setAppState('select')} />
        ) : appState === 'select' ? (
            <MainSelector onImageUpload={handleImageUpload} onStartCollage={handleStartCollage} onStartTextToImage={handleStartTextToImage} />
        ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">
                    {appState === 'collage' ? 'Collage Creator' : 'Image Editor'}
                </h1>
                <button
                    onClick={() => handleClear()}
                    className="flex items-center justify-center px-4 py-2 bg-[rgb(var(--bg-interactive-rgb))] text-primary font-semibold rounded-lg shadow-md hover:bg-[rgb(var(--bg-interactive-hover-rgb))] transition-all duration-200"
                >
                    <BackIcon />
                    Back to Home
                </button>
              </div>

              <div className="grid grid-cols-1 gap-12">
                  <div>
                      {appState === 'collage' && <CollageCreator onFinalize={handleCollageFinalized} onCancel={() => handleClear()} />}
                      {appState === 't2i' && (
                        <TextToImage
                          onUseInEditor={(dataUrl) => {
                            setImageFile({ base64: dataUrl.split(',')[1], mimeType: 'image/png', name: `t2i-${Date.now()}.png` });
                            setCurrentImageSrc(dataUrl);
                            setAppState('edit');
                          }}
                          onBack={() => setAppState('select')}
                        />
                      )}
                      
                      {appState === 'edit' && imageFile && currentImageSrc && (
                          <EditorPanel
                              imageSrc={currentImageSrc}
                              mimeType={imageFile.mimeType}
                              isLoading={isLoading}
                              prompt={prompt}
                              setPrompt={setPrompt}
                              onAIPromptEdit={handleAIPromptEdit}
                              onSaveToGallery={handleSaveToGallery}
                              onClear={() => handleClear()}
                          />
                      )}

                      {error && (appState === 'edit' || appState === 'collage') && <div className="mt-4 p-3 bg-[rgba(var(--danger-bg-rgb),0.5)] text-[rgb(var(--danger-text-rgb))] border border-[rgba(var(--danger-border-rgb),0.3)] rounded-lg text-sm">{error}</div>}
                  </div>
                  <Gallery images={galleryImages} />
              </div>
            </>
        )}
      </main>
    </div>
  );
};

export default App;