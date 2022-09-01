import { FC, useEffect, useState } from 'react';
import * as React from 'react';
import { useDebounce } from 'use-debounce';

const Tag: FC<{
  query: string;
  title: string;
  isSelected: (s: string) => boolean;
  setSelected: (s: string) => void;
}> = ({ query, title, isSelected, setSelected }) => (
  <span
    className={'tag ' + (isSelected(query) ? 'is-primary' : '')}
    style={{ cursor: 'pointer' }}
    onClick={() => setSelected(query)}
    title={title}
  >
    {query}
  </span>
);

const pageArr = (results: number, pageSize: number): number[] => {
  const numPages = Math.ceil(results / pageSize);
  const ret = [];
  for (let i = 1; i < numPages && i < 50; i++) {
    ret.push(i);
  }
  return ret;
};

const Pager: FC<{
  results: number;
  pageSize: number;
  currentPage: number;
  gotoPage: (p: number) => void;
}> = ({ results, pageSize, currentPage, gotoPage }) => (
  <nav className="pagination" role="navigation" aria-label="pagination">
    <ul className="pagination-list">
      {pageArr(results, pageSize).map((page) => (
        <li>
          <a
            className={
              'pagination-link ' + (currentPage === page ? 'is-current' : '')
            }
            aria-label={`Goto page ${page}`}
            onClick={() => {
              gotoPage(page);
              scrollTo({ top: 0 });
            }}
          >
            {page}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export const Search: FC<{}> = ({}) => {
  const [data, setData] = useState({
    data: [],
    totalHits: 0,
  });

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [query, _setQuery] = useState('');
  const setQuery = (q: string) => {
    _setQuery(q);
    setPage(1);
  };
  const [queryDebounced] = useDebounce(query, 1000);
  const [tags, setTags] = useState(['fable']);
  const isSelected = (q: string) => tags.find((pt) => pt === q) != null;
  const setSelected = (q: string) => {
    setTags(isSelected(q) ? tags.filter((pt) => pt !== q) : tags.concat(q));
    setPage(1);
  };
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    //https://docs.microsoft.com/en-us/nuget/api/search-query-service-resource
    const tagsStrQ = tags.reduce((acc, item) => `${acc} tags:${item}`, '');
    const queryDebouncedPlusTags = queryDebounced + ' ' + tagsStrQ;
    setLoading(true);
    fetch(
      `https://azuresearch-usnc.nuget.org/query?q=${queryDebouncedPlusTags}&skip=${
        (page - 1) * pageSize
      }&take=${pageSize}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        setLoading(false);
        return setData(json);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  }, [queryDebounced, tags.length, page]);

  return (
    <div className="content">
      <div className="page-header">
        <input
          className="input is-primary is-large"
          type="text"
          placeholder="Search NuGet for Fable packages..."
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </div>
      <div className="is-info message">
        <div className="message-body">
          This will search Nuget.org for any packages with the following tags
        </div>
      </div>
      <div className="tags are-medium">
        <Tag
          query="fable"
          title="Fable"
          isSelected={isSelected}
          setSelected={setSelected}
        />
        <Tag
          query="fable:react"
          title="Integrates with the react ecosystem"
          isSelected={isSelected}
          setSelected={setSelected}
        />
        <Tag
          query="fable-binding:js"
          title="Binds to an existing js library from the npm ecosystem"
          isSelected={isSelected}
          setSelected={setSelected}
        />
      </div>
      <div className="tags are-medium">
        <Tag
          query="fable-target:all"
          title="Supports all fable language targets (including future targets) as there is no target-specific code present"
          isSelected={isSelected}
          setSelected={setSelected}
        />
        <Tag
          query="fable-target:ts"
          title="Supports typescript as a fable compilation target"
          isSelected={isSelected}
          setSelected={setSelected}
        />
        <Tag
          query="fable-target:js"
          title="Supports javascript as a fable compilation target"
          isSelected={isSelected}
          setSelected={setSelected}
        />
        <Tag
          query="fable-target:python"
          title="supports python as a fable compilation target"
          isSelected={isSelected}
          setSelected={setSelected}
        />
        <Tag
          query="fable-target:dart"
          title="supports dart as a fable compilation target"
          isSelected={isSelected}
          setSelected={setSelected}
        />
        <Tag
          query="fable-target:rust"
          title="supports rust  as a fable compilation target"
          isSelected={isSelected}
          setSelected={setSelected}
        />
        <Tag
          query="fable-target:php"
          title="supports php as a fable compilation target"
          isSelected={isSelected}
          setSelected={setSelected}
        />
      </div>

      {isLoading ? (
        <progress className="progress is-small is-primary" max="100"></progress>
      ) : null}

      {data.data.map((d) => (
        <div style={{ padding: 10 }} className="container">
          <div className="notification is-primary is-light">
            <a href={d.projectUrl} style={{ textDecoration: 'none' }}>
              <div className="columns">
                <div className="column">
                  <img src={d.iconUrl} width={100} />
                </div>
                <div
                  className="column"
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  {d.title}
                </div>
                <div className="column">Version: {d.version}</div>
                <div className="column">By: {d.authors}</div>
              </div>
              <div className="column">{d.description}</div>

              {/* <div className="column">{d.versions}</div> */}
              {/* <div className="column">
                {JSON.stringify(d)}
                </div> */}
            </a>
          </div>
        </div>
      ))}
      <div>total hits {data.totalHits}</div>
      <Pager
        pageSize={pageSize}
        currentPage={page}
        results={data.totalHits}
        gotoPage={setPage}
      />
      <div className="is-info message">
        <div className="message-body">
          Want to create your own? See the{' '}
          <a href="https://fable.io/docs/your-fable-project/author-a-fable-library.html">
            documentation
          </a>{' '}
          on authoring packages.
        </div>
      </div>
    </div>
  );
};
