import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Global from 'global/global';
import styles from './playlist.module.css';
import Song from './Song/Song';
import { PropsSongs } from 'componentes/Sidebar/types/propsSongs.module';
import { FastAverageColor } from 'fast-average-color';
import defaultThumbnailPlaylist from '../../assets/imgs/DefaultThumbnailPlaylist.jpg';

interface PropsPlaylist {
  changeSongName: Function;
}

export default function Playlist(props: PropsPlaylist) {
  const [mainColorThumbnail, setMainColorThumbnail] = useState('');

  /* Get current Playlist Name */
  const location = useLocation();
  let playlistName = decodeURIComponent(
    location.pathname.split('/').slice(-1)[0]
  );


  const [thumbnail, setThumbnail] = useState<string>('');
  const [numberSongs, setNumberSongs] = useState<number>(0);
  const [songs, setSongs] = useState<PropsSongs[]>();

  const loadPlaylistData = async () => {
    fetch(encodeURI(Global.backendBaseUrl + 'playlists/dto/' + playlistName))
      .then((res) => res.json())
      .then(async (res) => {
        setThumbnail(res['photo'] === '' ? defaultThumbnailPlaylist : res['photo']);
        if (res['song_names']) {
          setNumberSongs(res['song_names'].length);
          let propsSongs: PropsSongs[] = [];

          for (let obj of res['song_names'].reverse()) {
            let propsSong: PropsSongs = {
              name: obj,
              playlistName: playlistName,
              artistName: '',
              index: 0,
              handleSongCliked: props.changeSongName,
              refreshPlaylistData: loadPlaylistData,
            };

            let artistName = await fetch(Global.backendBaseUrl + 'canciones/dto/' + obj)
              .then((res) => res.json())
              .then((res) => res["artist"]);

            propsSong['artistName'] = artistName;
            propsSongs.push(propsSong);
          }

          setSongs(propsSongs);
        }
      })
      .catch((error) => {
        console.log('No se puede obtener la playlist');
      });
  };

  useEffect(() => {
    loadPlaylistData();
  }, [location]);

  /* Process photo color */
  useEffect(() => {
    const fac = new FastAverageColor();

    let options = {
      crossOrigin: '*',
    };

    fac
      .getColorAsync(thumbnail, options)
      .then((color) => {
        setMainColorThumbnail(color.hex);
      })
      .catch((e) => {
        //console.log(e);
      });

    fac.destroy();
  }, [thumbnail]);


  /*  */

  return (
    <div
      className={`d-flex container-fluid flex-column ${styles.wrapperPlaylist}`}
    >
      <div
        className={`d-flex container-fluid flex-column ${styles.backgroundFilter} ${styles.header}`}
        style={{ backgroundColor: `${mainColorThumbnail}` }}
      >
        <div className={`d-flex flex-row container-fluid ${styles.nonBlurred}`}>
          <button className={`${styles.wrapperThumbnail}`}>
            <img className="" src={`${thumbnail}`} alt="" />
          </button>

          <div
            className={`d-flex container-fluid flex-column ${styles.headerText}`}
          >
            <p>Álbum</p>
            <h1>{playlistName}</h1>
            <p>{numberSongs} canciones</p>
          </div>
        </div>

        <div className={` ${styles.nonBlurred} ${styles.subhHeaderPlaylist}`}>
          <button className={`${styles.hoverablePlayButton}`}>
            <i className="fa-solid fa-circle-play" style={{ color: 'var(--primary-green)',fontSize:'3rem' }}></i>
          </button>
          <button className={`${styles.hoverablePlayButton}`}>
            <i className="fa-solid fa-circle-pause" style={{ color: 'var(--primary-green)',fontSize:'3rem' }}></i>
          </button>
          <button className={`${styles.hoverableItemubheader}`}>
            <i className="fa-regular fa-heart" style={{ color: 'var(--secondary-white)',fontSize:'1.75rem' }}></i>
          </button>
          <button>
            <i className="fa-solid fa-heart" style={{ color: 'var(--primary-green)',fontSize:'1.75rem' }}></i>
          </button>
          <button className={`${styles.hoverableItemubheader}`}>
            <i className="fa-regular fa-circle-down" style={{ color: 'var(--secondary-white)',fontSize:'1.75rem' }}></i>
          </button>
          <button className={`${styles.hoverableItemubheader}`}>
            <i
              className="fa-solid fa-ellipsis"
              style={{ color: 'var(--secondary-white)' }}
            ></i>
          </button>
        </div>
      </div>

      <div className={`d-flex container-fluid ${styles.wrapperSongTable}`}>
        <ul className={`d-flex flex-column container-fluid`}>
          <li
            className={`container-fluid ${styles.gridContainer} ${styles.gridContainerFirstRow}`}
          >
            <span className={` ${styles.songNumberTable}`}>#</span>
            <span
              className={` ${styles.songTitleTable}`}
              style={{ color: 'var(--secondary-white)' }}
            >
              Título
            </span>
            <span className={` ${styles.gridItem}`}>
              <i className="fa-regular fa-clock"></i>
            </span>
          </li>

          {songs &&
            songs.map((song, index) => {
              return (
                <Song
                  key={index}
                  name={song.name}
                  playlistName={playlistName}
                  artistName={song.artistName}
                  index={index + 1}
                  handleSongCliked={props.changeSongName}
                  refreshPlaylistData={loadPlaylistData}
                />
              );
            })}
        </ul>
      </div>
    </div>
  );
}
