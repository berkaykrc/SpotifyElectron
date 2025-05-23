import { useState, ChangeEvent } from 'react';
import { genreColorsMapping } from 'utils/genre';
import SongCard from 'components/Cards/SongCard/SongCard';
import PlaylistCard from 'components/Cards/PlaylistCard/PlaylistCard';
import ArtistCard from 'components/Cards/ArtistCard/ArtistCard';
import UserCard from 'components/Cards/UserCard/UserCard';
import useFetchSearchItemsByName from 'hooks/useFetchGetSearchItemsByName';
import { t } from 'i18next';
import useFetchGetGenres from '../../hooks/useFetchGetGenres';
import styles from './browse.module.css';
import GenreCard from '../../components/Cards/GenreCard/GenreCard';

interface PropsBrowse {
  refreshSidebarData: () => void;
}

export default function Browse({ refreshSidebarData }: PropsBrowse) {
  const [filterName, setFilterName] = useState('');

  const { filteredPlaylists, filteredArtists, filteredSongs, filteredUsers } =
    useFetchSearchItemsByName(filterName, refreshSidebarData);

  const handleChangeSearchBar = (event: ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value?.trim());
  };

  /* Genres */

  const { genres } = useFetchGetGenres();

  return (
    <div className={`container-fluid d-flex flex-column ${styles.principal}`}>
      <div
        className={`container-fluid d-flex flex-column ${styles.columnofGenres}`}
      >
        <header className="container-fluid d-flex flex-row mb-4">
          <div className={`d-flex ${styles.searchBarWrapper}`}>
            <i className="me-2 fa-solid fa-magnifying-glass fa-fw" />
            <input
              type="text"
              placeholder={t('browse.what-want-to-play')}
              className={`${styles.inputSearchBar}`}
              onChange={handleChangeSearchBar}
              data-testid="browse-input-searchbar"
            />
          </div>
        </header>
        {filterName && (
          <>
            {filteredSongs.length > 0 && (
              <div className="container-fluid d-flex flex-column mb-5">
                <header className="container-fluid d-flex flex-row">
                  <div
                    className={`container-fluid d-flex ${styles.columnTitle}`}
                  >
                    <h4>{t('common.songs')}</h4>
                  </div>
                </header>
                <div
                  className={`container-fluid d-flex flex-row ${styles.cardContainer}`}
                  style={{ gap: '14px' }}
                >
                  {filteredSongs.map((song) => (
                    <SongCard
                      name={song.name}
                      artist={song.artist}
                      photo={song.photo}
                      refreshSidebarData={song.refreshSidebarData}
                      key={`${song.name}${song.artist}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {filteredPlaylists.length > 0 && (
              <div className="container-fluid d-flex flex-column mb-5">
                <header className="container-fluid d-flex flex-row">
                  <div
                    className={`container-fluid d-flex ${styles.columnTitle}`}
                  >
                    <h4>{t('common.playlists')}</h4>
                  </div>
                </header>
                <div
                  className={`container-fluid d-flex flex-row ${styles.cardContainer}`}
                  style={{ gap: '14px' }}
                >
                  {filteredPlaylists.map((playlist) => (
                    <PlaylistCard
                      name={playlist.name}
                      photo={playlist.photo}
                      description={playlist.description}
                      owner={playlist.owner}
                      refreshSidebarData={playlist.refreshSidebarData}
                      key={`${playlist.name}${playlist.owner}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {filteredArtists.length > 0 && (
              <div className="container-fluid d-flex flex-column mb-5">
                <header className="container-fluid d-flex flex-row">
                  <div
                    className={`container-fluid d-flex ${styles.columnTitle}`}
                  >
                    <h4> {t('common.artists')}</h4>
                  </div>
                </header>
                <div
                  className={`container-fluid d-flex flex-row ${styles.cardContainer}`}
                  style={{ gap: '14px' }}
                >
                  {filteredArtists.map((artist) => (
                    <ArtistCard
                      name={artist.name}
                      photo={artist.photo}
                      key={`${artist.name}${artist.photo}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {filteredUsers.length > 0 && (
              <div className="container-fluid d-flex flex-column mb-5">
                <header className="container-fluid d-flex flex-row">
                  <div
                    className={`container-fluid d-flex ${styles.columnTitle}`}
                  >
                    <h4>{t('common.users')}</h4>
                  </div>
                </header>
                <div
                  className={`container-fluid d-flex flex-row ${styles.cardContainer}`}
                  style={{ gap: '14px' }}
                >
                  {filteredUsers.map((user) => (
                    <UserCard
                      name={user.name}
                      photo={user.photo}
                      key={`${user.name}${user.photo}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {!filterName && (
          <>
            <header className="container-fluid d-flex flex-row">
              <div className={`container-fluid d-flex ${styles.columnTitle}`}>
                <h4>{t('browse.browse-all')}</h4>
              </div>
            </header>
            <div
              className={`container-fluid d-flex flex-row ${styles.cardContainer}`}
            >
              {genres &&
                Object.values(genres).map((genre) => {
                  return (
                    <GenreCard
                      key={genre as string}
                      name={genre as string}
                      color={genreColorsMapping[genre as string]}
                    />
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
