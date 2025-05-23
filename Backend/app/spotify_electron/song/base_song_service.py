"""
Base Song service for handling bussiness logic

Handles common methods between all song architectures
Redirects to the specific architecture service in case the method is not common
"""

import app.spotify_electron.song.base_song_repository as base_song_repository
from app.logging.logging_constants import LOGGING_BASE_SONG_SERVICE
from app.logging.logging_schema import SpotifyElectronLogger
from app.spotify_electron.genre.genre_schema import Genre, GenreNotValidError
from app.spotify_electron.song.base_song_schema import (
    SongBadNameError,
    SongMetadataDTO,
    SongNotFoundError,
    SongRepositoryError,
    SongServiceError,
    get_song_metadata_dto_from_dao,
)
from app.spotify_electron.song.providers.song_service_provider import get_song_service
from app.spotify_electron.song.validations.base_song_service_validations import (
    validate_song_name_parameter,
    validate_song_should_exists,
)

base_song_service_logger = SpotifyElectronLogger(LOGGING_BASE_SONG_SERVICE).get_logger()


def check_song_exists(name: str) -> bool:
    """Check if song exists

    Args:
        name (str): song name

    Returns:
        bool: if the songs exists
    """
    return base_song_repository.check_song_exists(name)


def get_song_metadata(name: str) -> SongMetadataDTO:
    """Get song metadata

    Args:
        name (str): song name

    Raises:
        SongBadNameError: bad song name
        SongNotFoundError: song doesn't exists
        SongServiceError: unexpected error getting song metadata

    Returns:
        SongMetadataDTO: song metadata
    """
    try:
        validate_song_name_parameter(name)

        song_metadata_dao = base_song_repository.get_song_metadata(name)
        song_dto = get_song_metadata_dto_from_dao(song_metadata_dao)

    except SongBadNameError as exception:
        base_song_service_logger.exception(f"Bad Song Name Parameter: {name}")
        raise SongBadNameError from exception
    except SongNotFoundError as exception:
        base_song_service_logger.exception(f"Song not found: {name}")
        raise SongNotFoundError from exception
    except SongRepositoryError as exception:
        base_song_service_logger.exception(
            f"Unexpected error in Song Repository getting song metadata: {name}"
        )
        raise SongServiceError from exception
    except Exception as exception:
        base_song_service_logger.exception(
            f"Unexpected error in Song Service getting song metadata: {name}"
        )
        raise SongServiceError from exception
    else:
        base_song_service_logger.info(f"Song metadata {name} retrieved successfully")
        return song_dto


def delete_song(name: str) -> None:
    """Delete song

    Args:
        name (str): song name
    """
    get_song_service().delete_song(name)


def get_songs_metadata(song_names: list[str]) -> list[SongMetadataDTO]:
    """Get multiple songs metadata

    Args:
        song_names (list[str]): list of song names

    Raises:
        SongServiceError: unexpected error getting song metadata

    Returns:
        list[SongMetadataDTO]: list of songs metadata
    """
    try:
        return [get_song_metadata(song_name) for song_name in song_names]
    except SongRepositoryError as exception:
        base_song_service_logger.exception(
            f"Unexpected error in Song Repository getting songs metadata for: {song_names}"
        )
        raise SongServiceError from exception
    except Exception as exception:
        base_song_service_logger.exception(
            f"Unexpected error in Song Service getting songs metadata for: {song_names}"
        )
        raise SongServiceError from exception


def increase_song_streams(name: str) -> None:
    """Increase by one the streams of a song

    Args:
        name (str): song name

    Raises:
        SongNotFoundError: song doesn't exists
        SongServiceError: unexpected error increasing song streams
    """
    try:
        validate_song_should_exists(name)
        base_song_repository.increase_song_streams(name)
    except SongNotFoundError as exception:
        base_song_service_logger.exception(f"Song not found: {name}")
        raise SongNotFoundError from exception
    except SongRepositoryError as exception:
        base_song_service_logger.exception(
            f"Unexpected error in Song Repository increasing song: {name} streams"
        )
        raise SongServiceError from exception
    except Exception as exception:
        base_song_service_logger.exception(
            f"Unexpected error in Song Service increasing song: {name} streams"
        )
        raise SongServiceError from exception


def search_by_name(name: str) -> list[SongMetadataDTO]:
    """Search song items that match a name

    Args:
        name (str): the name to match

    Returns:
        list[SongMetadataDTO]: a list of song metadatas that matched the name
    """
    # TODO only do 1 request
    song_names = base_song_repository.get_song_names_search_by_name(name)

    return get_songs_metadata(song_names)


def get_songs_by_genre(genre: Genre) -> list[SongMetadataDTO]:
    """Get songs by genre

    Args:
        genre (Genre): the genre

    Raises:
        GenreNotValidError: invalid genre
        SongServiceError: unexpected error getting  songs by genre

    Returns:
        list[SongMetadataDTO]: the list of songs that matched the genre
    """
    try:
        str_genre = Genre.get_genre_string_value(genre)
        songs_dao = base_song_repository.get_songs_metadata_by_genre(str_genre)
        return [get_song_metadata_dto_from_dao(song_dao) for song_dao in songs_dao]
    except GenreNotValidError as exception:
        base_song_service_logger.exception(f"Bad genre provided {genre}")
        raise GenreNotValidError from exception
    except SongRepositoryError as exception:
        base_song_service_logger.exception(
            f"Unexpected error in Song Repository getting songs by genre: {genre}"
        )
        raise SongServiceError from exception
    except Exception as exception:
        base_song_service_logger.exception(
            f"Unexpected error in Song Service getting songs by genre: {genre}"
        )
        raise SongServiceError from exception
