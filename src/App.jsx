import { useEffect, useState } from 'react';
import PlayButton from './components/playButton';
import LinkIcon from './components/linkIcon';
import Spinner from './components/spinner';
import ZapIcon from './components/ZapIcon';
import ShieldIcon from './components/ShieldIcon';
import DownloadIcon from './components/DownloadIcon';
import CloseIcon from './components/CloseIcon';

function App() {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [url, setUrl] = useState('');
  const [qualities, setQualities] = useState(null);
  const [thumbnail, setThumbnail] = useState('');
  const [title, setTitle] = useState('');
  const [hasAudio, setHasAudio] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [qualityErrorMessage, setQualityErrorMessage] = useState('');
  const [downloadErrorMessage, setDownloadErrorMessage] = useState('');
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  function clearStates() {
    setQualities(null);
    setThumbnail('');
    setTitle('');
    setHasAudio(null);
    setQualityErrorMessage(null);
    setDownloadErrorMessage(null);
    setDownloadCompleted(false);
  }

  async function fetchVideoDetails() {
    console.log('Getting video details...');
    try {
      const response = await fetch('/qualities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      console.log(url);

      const result = await response.json();
      console.log(result);

      setQualities(result.qualities);
      setThumbnail(result.thumbnail);
      setTitle(result.title);

      if (result.acodec != 'none') setHasAudio(true);
      else setHasAudio(false);

      if (result.success != true) {
        setQualityErrorMessage(result.videoMessage);
      }

      console.log(result.qualities);

      setIsFetching(false);
      console.log(result.info);
    } catch (error) {
      setIsFetching(false);
      console.error(error);
      clearStates();
    }
  }

  useEffect(() => {
    clearStates();
  }, [url]);

  async function downloadVideo() {
    try {
      const response = await fetch('/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedFormat,
          url,
          hasAudio,
        }),
      });

      const result = await response.json();

      if (result.success == true) {
        setDownloadCompleted(true);
      } else {
        setDownloadErrorMessage(result.videoMessage);
      }

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <header className='px-6 py-5'>
        <span className='text-red-700 font-bold text-2xl tracking-tight'>
          SaveNow
        </span>
      </header>

      <main className='px-6 pt-8 pb-12'>
        <div className='max-w-2xl mx-auto text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            Download Content Fast
          </h1>
          <p className='text-gray-600 text-base leading-relaxed max-w-md mx-auto mb-10'>
            Save high-quality content from YouTube, Instagram, Facebook, X and
            more instantly. Fast, free, and secure downloads for every creator.
          </p>
          <div className='bg-white rounded-2xl shadow-sm border border-red-100 p-6 mb-6'>
            <div className='relative mb-4'>
              <LinkIcon className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                name='url'
                value={url}
                placeholder='Paste your video url...'
                className='w-full pl-12 pr-4 py-4 bg-red-50/50 rounded-xl border-0 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 text-base'
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
              />
              <button
                onClick={() => {
                  setUrl('');
                  clearStates();
                }}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition'
              >
                <CloseIcon />
              </button>
            </div>
            <button
              type='button'
              disabled={isFetching || !url.trim()}
              className='w-full bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed'
              id='show-quality-btn'
              onClick={() => {
                fetchVideoDetails();
                setIsFetching(true);
                clearStates();
              }}
            >
              Get video details
            </button>
          </div>
        </div>

        {qualityErrorMessage && (
          <div className='max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-red-100 p-5 mb-5'>
            {qualityErrorMessage}
          </div>
        )}

        {(isFetching || qualities) && (
          <div className='max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-red-100 p-5 mb-5'>
            {isFetching && <Spinner />}
            {qualities && (
              <>
                <div className='relative rounded-2xl overflow-hidden mb-4 aspect-video bg-gray-900'>
                  <img
                    src={thumbnail}
                    alt={title}
                    className='w-full h-full object-cover opacity-90'
                  />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm'>
                      <PlayButton />
                    </div>
                  </div>
                </div>

                <h2 className='text-lg font-bold text-gray-900 mb-5'>
                  {title}
                </h2>

                <p className='text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3'>
                  Select Quality
                </p>
                <div className='grid grid-cols-2 gap-3 mb-5'>
                  {qualities.map((quality) => (
                    <button
                      key={quality.format_id}
                      value={quality.height}
                      onClick={() => {
                        setIsClicked(true);
                        setSelectedFormat(quality.format_id);
                      }}
                      className={`rounded-xl p-3.5 text-left transition-all border ${
                        selectedFormat === quality.format_id
                          ? 'bg-red-700 border-red-700 text-white shadow-md'
                          : 'bg-red-50/50 border-red-100 text-gray-700 hover:bg-red-100/50'
                      }`}
                    >
                      <div
                        className={`text-xs ${
                          selectedFormat === quality.format_id
                            ? 'text-red-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {quality.height}p
                      </div>
                    </button>
                  ))}
                </div>

                {downloadCompleted && (
                  <div className='rounded-xl border border-gray-300 bg-gray-100 flex flex-col gap-1 p-3 mb-3'>
                    <p className='font-semibold text-green-700'>
                      Download Completed
                    </p>
                    <p className='text-gray-800'>
                      Your download has been completed successfully.
                    </p>
                  </div>
                )}

                {downloadErrorMessage && (
                  <div className='rounded-xl border border-red-300 bg-[#ffd0c8] flex items-center gap-1 shadow-sm p-3 mb-3'>
                    <div className='grow text-left'>
                      <p className='font-semibold text-red-700'>
                        Download failed
                      </p>
                      <p className='text-sm'>{downloadErrorMessage}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    downloadVideo();
                    setDownloadCompleted(false);
                  }}
                  disabled={!selectedFormat}
                  className='w-full bg-red-600 disabled:bg-red-400 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-red-200'
                >
                  <DownloadIcon className='w-5 h-5' />
                  Download
                </button>
              </>
            )}
          </div>
        )}

        <section className='mt-24'>
          <div className='text-center mb-16'>
            <span className='text-[#b7102a] mb-1 block text-2xl font-semibold'>
              How it Works
            </span>
          </div>
          <div className='flex flex-col md:flex-row justify-between items-center gap-10 relative'>
            <div className='flex-1 flex flex-col items-center text-center'>
              <div className='relative mb-6'>
                <div className='size-20 rounded-full bg-[#db313f] text-white flex items-center justify-center  font-bold z-10 relative'>
                  1
                </div>
                <div className='absolute -inset-2 bg-[#db313f]/20 rounded-full blur-xl scale-0 group-hover:scale-100 transition-transform duration-500'></div>
              </div>
              <h4 className='mb-1'>Paste URL</h4>
              <p className='text-[#5b403f] max-w-60'>
                Copy the video link from any platform and paste it into the
                search bar above.
              </p>
            </div>
            <div className='hidden md:block absolute top-10 left-[25%] right-[65%] h-0.5 bg-[#e4bebc]'></div>
            <div className='flex-1 flex flex-col items-center text-center'>
              <div className='relative mb-6'>
                <div className='size-20 rounded-full bg-[#db313f] text-white flex items-center justify-center  font-bold z-10 relative'>
                  2
                </div>
                <div className='absolute -inset-2 bg-[#db313f]/20 rounded-full blur-xl scale-0 group-hover:scale-100 transition-transform duration-500'></div>
              </div>
              <h4 className=' mb-1'>Select Quality</h4>
              <p className='text-[#5b403f]  max-w-60'>
                Choose your preferred resolution (360p, 720p, 1080p).
              </p>
            </div>
            <div className='hidden md:block absolute top-10 left-[60%] right-[30%] h-0.5 bg-[#e4bebc]'></div>
            <div className='flex-1 flex flex-col items-center text-center group'>
              <div className='relative mb-6'>
                <div className='size-20 rounded-full bg-[#db313f] text-white flex items-center justify-center  font-bold z-10 relative'>
                  3
                </div>
                <div className='absolute -inset-2 bg-[#db313f]/20 rounded-full blur-xl scale-0 group-hover:scale-100 transition-transform duration-500'></div>
              </div>
              <h4 className=' mb-1'>Download</h4>
              <p className='text-[#5b403f]  max-w-60'>
                Click the final download button and save the file directly to
                your device storage.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <div className='max-w-2xl mx-auto space-y-4 mt-8'>
          {/* Fast Download */}
          <div className='bg-white shadow-xs rounded-2xl p-6 border border-red-100/50'>
            <div className='w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mb-3 text-white'>
              <ZapIcon />
            </div>
            <h3 className='text-lg font-bold text-gray-900 mb-1'>
              Fast Download
            </h3>
            <p className='text-gray-600 text-sm leading-relaxed'>
              Instant download for any video of any length
            </p>
          </div>

          {/* HD Quality */}
          <div className='bg-white shadow-xs rounded-2xl p-6 border border-red-100/50'>
            <div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3'>
              <span className='text-white text-xs font-bold border border-white px-1 rounded'>
                HD
              </span>
            </div>
            <h3 className='text-lg font-bold text-gray-900 mb-1'>HD Quality</h3>
            <p className='text-gray-600 text-sm leading-relaxed'>
              Support for 4K, 1080p, and high-bitrate MP3 audio extraction.
            </p>
          </div>

          {/* Secure & Private */}
          <div className='bg-white shadow-xs rounded-2xl p-6 border border-red-100/50'>
            <div className='w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center mb-3 text-white'>
              <ShieldIcon />
            </div>
            <h3 className='text-lg font-bold text-gray-900 mb-1'>
              Secure & Private
            </h3>
            <p className='text-gray-600 text-sm leading-relaxed'>
              We don't track your downloads or store your data on our servers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='px-6 py-8 border-t border-red-100 mt-4'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='flex items-center justify-center gap-2 mb-4'>
            <span className='text-red-700 font-bold text-lg'>SaveNow</span>
          </div>

          <p className='text-gray-400 text-sm'>
            © {new Date().getFullYear()} SaveNow.
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
