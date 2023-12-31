import CustomProductCard from '@/components/cards/CustomProductCard';
import CustomFilter from '@/components/shared/CustomFilter';
import { productService } from '@/services';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

function Collection() {
    const [isLoading, setLoading] = useState(false);
    const [isLoadingMore, setLoadingMore] = useState(false);
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [filterMenu, setFilterMenu] = useState(null);
    const { slug } = useParams();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchKeyword = searchParams.get('q');

    const handleGetProducts = async (categories, page) => {
        setLoading(true);
        const response = await productService.getProductsService(categories, page);
        if (response && response.code === 'SUCCESS') {
            const { page, total_pages, total_results, result } = response;
            setProducts(result);
            setCurrentPage(Number(page));
            setTotalPages(Number(total_pages));
            setTotalResults(Number(total_results));
        }
        setLoading(false);
    };

    const handleInfinityGetProducts = async (categories, page) => {
        setLoading(true);
        const response = await productService.getProductsService(categories, page);
        if (response && response.code === 'SUCCESS') {
            const { page, result } = response;
            setCurrentPage(Number(page));
            setProducts((prevState) => [...prevState, ...result]);
        }
        setLoading(false);
    };

    const handleSearchProducts = async (keyword, page) => {
        setLoading(true);
        const response = await productService.searchProductsService(keyword, page);
        if (response && response.code === 'SUCCESS') {
            const { page, total_pages, total_results, result } = response;
            setProducts(result);
            setCurrentPage(Number(page));
            setTotalPages(Number(total_pages));
            setTotalResults(Number(total_results));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (searchKeyword) {
            setLoadingMore(false);
            handleSearchProducts(searchKeyword);
        } else {
            setLoadingMore(false);
            handleGetProducts(slug, 1);
        }
    }, [slug, searchKeyword]);

    useEffect(() => {
        const handleGetProductsCount = async () => {
            setLoading(true);
            const response = await productService.getProductsCountService();
            if (response && response.code === 'SUCCESS') {
                setFilterMenu(response.result);
            }
            setLoading(false);
        };

        handleGetProductsCount();
    }, []);

    useEffect(() => {
        if (totalPages > currentPage) {
            setLoadingMore(true);
        } else {
            setLoadingMore(false);
        }
    }, [totalPages, currentPage]);

    const handleInfiniteScroll = () => {
        if (isLoadingMore) {
            handleInfinityGetProducts(slug, currentPage + 1);
        }
    };

    return (
        <div className={'py-8'}>
            <div className="mx-auto flex w-full max-w-[1440px] flex-wrap gap-4 p-4 md:flex-nowrap">
                <div className="w-full shrink-0 md:w-max">{filterMenu && <CustomFilter contents={filterMenu} />}</div>
                <div className="min-h-screen flex-1">
                    {products.length > 0 ? (
                        <InfiniteScroll
                            dataLength={products.length}
                            next={handleInfiniteScroll}
                            hasMore={isLoadingMore}
                            loader={isLoadingMore ? <CustomProductCard /> : null}
                            className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                        >
                            {products.map((item, index) => (
                                <CustomProductCard key={index} data={item} />
                            ))}
                        </InfiniteScroll>
                    ) : (
                        <Card className="flex h-full items-center justify-center">
                            <Typography className="text-lg font-semibold">Không tìm thấy sản phẩm phù hợp</Typography>
                        </Card>
                    )}
                    {totalPages === currentPage && products.length > 0 && (
                        <div>
                            <hr className="mx-auto mt-16 w-full max-w-xs border-t border-blue-gray-100" />
                            <Typography className="mx-auto mb-16 mt-6 w-max text-center font-semibold">
                                Bạn đã xem hết rồi
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Collection;
